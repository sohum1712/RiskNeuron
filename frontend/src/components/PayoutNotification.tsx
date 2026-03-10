import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

interface PayoutData {
  amount: number;
  workerName: string;
  disruptionType: string;
  upiReference: string;
}

export const showPayoutNotification = (data: PayoutData) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-lg font-bold text-white">
                💰 ₹{data.amount.toFixed(0)} credited!
              </p>
              <p className="mt-1 text-sm text-emerald-50">
                {data.workerName}
              </p>
              <p className="mt-1 text-xs text-emerald-100">
                {data.disruptionType.replace(/_/g, ' ')} • {data.upiReference}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-emerald-400">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'bottom-right',
    }
  );
};
