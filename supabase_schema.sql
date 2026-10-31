-- ====================================================================
-- CICR INVENTORY PORTAL - SUPABASE DATABASE SCHEMA
-- Centre for Innovation, Creativity & Robotics
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    roll_number TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    total_qty INTEGER NOT NULL DEFAULT 1 CHECK (total_qty >= 0),
    available_qty INTEGER NOT NULL DEFAULT 1 CHECK (available_qty >= 0),
    min_threshold INTEGER DEFAULT 2 CHECK (min_threshold >= 0),
    condition TEXT DEFAULT 'Good',
    status TEXT DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Maintenance')),
    image_url TEXT,
    datasheet_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inventory_items
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good';

DO $$
BEGIN
 IF NOT EXISTS (
   SELECT 1
   FROM pg_constraint
   WHERE conrelid = 'public.inventory_items'::regclass
     AND conname = 'inventory_items_sku_key'
 ) THEN
   ALTER TABLE public.inventory_items
     ADD CONSTRAINT inventory_items_sku_key UNIQUE (sku);
 END IF;
END;
$$;

-- 4. Create Borrow Requests Table
CREATE TABLE IF NOT EXISTS public.borrow_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    project_name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'overdue')),
    borrow_date DATE,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    approved_by TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    item_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, roll_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'roll_number', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    roll_number = EXCLUDED.roll_number,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Trigger to auto-update available_qty when borrow request is approved/returned
CREATE OR REPLACE FUNCTION public.update_inventory_on_borrow()
RETURNS TRIGGER AS $$
BEGIN
  -- When request is approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.inventory_items
    SET available_qty = GREATEST(0, available_qty - NEW.quantity),
        status = CASE 
          WHEN GREATEST(0, available_qty - NEW.quantity) = 0 THEN 'Out of Stock'
          WHEN GREATEST(0, available_qty - NEW.quantity) <= min_threshold THEN 'Low Stock'
          ELSE 'In Stock'
        END,
        updated_at = NOW()
    WHERE id = NEW.item_id;
  END IF;

  -- When request is returned
  IF NEW.status = 'returned' AND (OLD.status IS NOT NULL AND OLD.status != 'returned') THEN
    UPDATE public.inventory_items
    SET available_qty = LEAST(total_qty, available_qty + NEW.quantity),
        status = CASE 
          WHEN LEAST(total_qty, available_qty + NEW.quantity) <= min_threshold AND LEAST(total_qty, available_qty + NEW.quantity) > 0 THEN 'Low Stock'
          WHEN LEAST(total_qty, available_qty + NEW.quantity) > min_threshold THEN 'In Stock'
          ELSE 'Out of Stock'
        END,
        updated_at = NOW()
    WHERE id = NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_borrow_request_status_change ON public.borrow_requests;
CREATE TRIGGER on_borrow_request_status_change
  AFTER UPDATE OF status ON public.borrow_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_borrow();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Profiles: everyone can view profiles, users can update their own profile
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Inventory items: readable by anyone, editable by authenticated users
DROP POLICY IF EXISTS "Inventory is viewable by all users" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can insert inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can update inventory items" ON public.inventory_items;
DROP POLICY IF EXISTS "Authenticated users can delete inventory items" ON public.inventory_items;
CREATE POLICY "Inventory is viewable by all users" 
  ON public.inventory_items FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert inventory items" 
  ON public.inventory_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inventory items" 
  ON public.inventory_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete inventory items" 
  ON public.inventory_items FOR DELETE USING (auth.role() = 'authenticated');

-- Borrow requests: all authenticated users can view, users can insert their own requests, authenticated can update
DROP POLICY IF EXISTS "Borrow requests viewable by authenticated users" ON public.borrow_requests;
DROP POLICY IF EXISTS "Users can create borrow requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Authenticated users can update borrow requests" ON public.borrow_requests;
CREATE POLICY "Borrow requests viewable by authenticated users" 
  ON public.borrow_requests FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create borrow requests" 
  ON public.borrow_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update borrow requests" 
  ON public.borrow_requests FOR UPDATE USING (auth.role() = 'authenticated');

-- Activity logs: viewable and insertable by authenticated users
DROP POLICY IF EXISTS "Activity logs viewable by authenticated users" ON public.activity_logs;
DROP POLICY IF EXISTS "Activity logs insertable by authenticated users" ON public.activity_logs;
CREATE POLICY "Activity logs viewable by authenticated users" 
  ON public.activity_logs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Activity logs insertable by authenticated users" 
  ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 10. Initial Seed Data for CICR Inventory
INSERT INTO public.inventory_items (name, sku, category, description, location, total_qty, available_qty, min_threshold, condition, status, image_url, datasheet_url)
VALUES
('ESP32-WROOM-32D Development Board', 'CICR-MCU-001', 'Microcontrollers & SBCs', 'Dual-core 240MHz Wi-Fi and Bluetooth MCU board with Type-C connector. Essential for IoT robotics projects.', 'Lab 2 - Cabinet A1', 15, 12, 3, 'New', 'In Stock', 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=600&q=80', 'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32d_esp32-wroom-32u_datasheet_en.pdf'),

('Arduino Mega 2560 R3', 'CICR-MCU-002', 'Microcontrollers & SBCs', 'ATmega2560 microcontroller board with 54 digital I/O pins, 16 analog inputs, 4 UARTs for complex robotic arms.', 'Lab 2 - Cabinet A1', 8, 5, 2, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80', 'https://docs.arduino.cc/resources/datasheets/A000067-datasheet.pdf'),

('Raspberry Pi 4 Model B (4GB)', 'CICR-SBC-001', 'Microcontrollers & SBCs', 'Broadcom BCM2711 quad-core Cortex-A72 (ARM v8) 64-bit SoC @ 1.5GHz. Used for autonomous robot ROS navigation & vision.', 'Lab 2 - Secure Locker 1', 6, 2, 2, 'Good', 'Low Stock', 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80', 'https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-datasheet.pdf'),

('RPLIDAR A1M8 360 Degree Laser Scanner', 'CICR-SEN-001', 'Sensors & Modules', 'Low-cost 2D LiDAR 12-meter range, 360-degree laser range scanner for SLAM, obstacle avoidance in autonomous rovers.', 'Lab 2 - Shelf B2', 4, 3, 1, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'https://www.slamtec.com/en/Lidar/A1'),

('MPU-6050 6-Axis Gyro & Accelerometer', 'CICR-SEN-002', 'Sensors & Modules', 'I2C 3-axis gyroscope and 3-axis accelerometer sensor module with Digital Motion Processor (DMP).', 'Lab 2 - Component Bin 4', 25, 20, 5, 'New', 'In Stock', 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80', 'https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf'),

('NEMA 17 Stepper Motor (1.5A 42BYGH)', 'CICR-MOT-001', 'Motors & Drivers', 'High torque bipolar stepper motor 40N.cm, 1.8 deg step angle. Used for 3D printer and precision CNC plotter.', 'Lab 3 - Heavy Shelf C', 12, 10, 3, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80', 'https://www.omc-stepperonline.com'),

('MG996R Metal Gear Digital High Torque Servo', 'CICR-MOT-002', 'Motors & Drivers', 'Metal gear servo motor with 11kg/cm torque, ideal for robotic arms, steering bipedal walkers.', 'Lab 2 - Bin 12', 18, 14, 4, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', ''),

('L298N Dual H-Bridge Motor Driver Module', 'CICR-DRV-001', 'Motors & Drivers', 'Stepper and DC dual motor controller board capable of driving up to 2A per channel with onboard 5V regulator.', 'Lab 2 - Bin 8', 20, 16, 5, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=600&q=80', ''),

('LiPo 3S 2200mAh 11.1V 35C Battery Pack', 'CICR-PWR-001', 'Power & Batteries', 'Rechargeable lithium polymer battery pack with XT60 connector for quadcopters and high-load ground robots.', 'Lab 3 - LiPo Safety Box', 8, 4, 2, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80', ''),

('Creality Ender-3 V2 3D Printer', 'CICR-FAB-001', 'Tools & Fabrication', 'FDM 3D Printer with silent motherboard, Carborundum glass bed, 220x220x250mm print volume.', 'Lab 3 - 3D Printing Bay', 2, 1, 1, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1631556097152-c39479cbfeab?auto=format&fit=crop&w=600&q=80', 'https://www.creality.com'),

('TS100 Smart Digital Soldering Iron Kit', 'CICR-TOOL-001', 'Tools & Fabrication', 'Portable programmable OLED display soldering iron with B2 tip and DC5525 power jack (12V-24V).', 'Lab 2 - Soldering Bench 1', 4, 3, 1, 'Good', 'In Stock', 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80', ''),

('HC-SR04 Ultrasonic Distance Sensor', 'CICR-SEN-003', 'Sensors & Modules', 'Ultrasonic sensor 2cm to 400cm non-contact measurement module for mobile robots.', 'Lab 2 - Bin 5', 30, 26, 6, 'New', 'In Stock', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', '')
ON CONFLICT (sku) DO NOTHING;
