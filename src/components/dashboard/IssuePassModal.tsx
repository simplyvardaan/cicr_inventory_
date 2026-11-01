import React from 'react';
import { PaymentStatus } from '../ui/payment-status';
import { BorrowRequest, InventoryItem } from '../../types/inventory';

interface IssuePassModalProps {
  request: BorrowRequest | null;
  item?: InventoryItem;
  onClose: () => void;
}

export const IssuePassModal: React.FC<IssuePassModalProps> = ({
  request,
  item,
  onClose,
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <PaymentStatus
        type="loan"
        status="success"
        title="Official Hardware Issue Pass"
        subtitle={`Clearance authorized by ${request.approved_by || 'Lab Administrator'}. Present this pass at CICR Lab to collect your component.`}
        amount={`${request.quantity} unit(s)`}
        amountLabel="Issued Quantity"
        transactionId={`ISSUE-${request.id.slice(0, 8).toUpperCase()}`}
        transactionLabel="Gate Pass Ref"
        paymentMethod={request.user_name}
        paymentMethodLabel="Issued To"
        items={[
          {
            name: request.item_name,
            quantity: request.quantity,
            price: `${request.quantity}x unit`,
          },
        ]}
        merchantName="CICR Robotics Lab"
        primaryActionLabel="Close Gate Pass"
        onClose={onClose}
      />
    </div>
  );
};
