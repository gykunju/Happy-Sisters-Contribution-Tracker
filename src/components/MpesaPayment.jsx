import { useState } from "react";
import { useUser } from "../context/UserContext";
import { MdPayment, MdPhone, MdMoney } from "react-icons/md";

const MpesaPayment = () => {
  const { user, supabase } = useUser();
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const formatPhoneNumber = (phone) => {
    // Remove any non-digits
    const cleaned = phone.replace(/\D/g, "");

    // Convert to international format
    if (cleaned.startsWith("0")) {
      return "254" + cleaned.substring(1);
    } else if (cleaned.startsWith("254")) {
      return cleaned;
    } else if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
      return "254" + cleaned;
    }
    return cleaned;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!amount || !phoneNumber) {
      setMessage("Please fill in all fields");
      setMessageType("error");
      return;
    }

    if (parseFloat(amount) < 1) {
      setMessage("Amount must be at least KES 1");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("mpesa-payment", {
        body: {
          amount: parseFloat(amount),
          phoneNumber: formattedPhone,
          userId: user.id,
          description: `Happy Sisters Contribution - ${user.email}`,
        },
      });

      if (error) throw error;

      if (data.ResponseCode === "0") {
        setMessage(
          "Payment request sent! Please check your phone and enter your M-Pesa PIN."
        );
        setMessageType("success");
        setAmount("");
        setPhoneNumber("");

        // Poll for transaction status
        pollTransactionStatus(data.CheckoutRequestID);
      } else {
        setMessage(
          data.ResponseDescription || "Payment failed. Please try again."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Payment failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const pollTransactionStatus = async (checkoutRequestId) => {
    const maxAttempts = 30; // Poll for 2.5 minutes
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setMessage(
          "Payment status unknown. Please check your M-Pesa messages."
        );
        setMessageType("error");
        return;
      }

      try {
        const { data } = await supabase
          .from("pending_transactions")
          .select("status, mpesa_receipt_number")
          .eq("checkout_request_id", checkoutRequestId)
          .single();

        if (data?.status === "completed") {
          setMessage(
            `Payment successful! Receipt: ${data.mpesa_receipt_number}`
          );
          setMessageType("success");
          // Refresh page data
          window.location.reload();
        } else if (data?.status === "failed") {
          setMessage("Payment was cancelled or failed. Please try again.");
          setMessageType("error");
        } else {
          // Still pending, continue polling
          attempts++;
          setTimeout(poll, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error("Polling error:", error);
        attempts++;
        setTimeout(poll, 5000);
      }
    };

    // Start polling after 10 seconds
    setTimeout(poll, 10000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <MdPayment size={24} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">M-Pesa Payment</h2>
          <p className="text-sm text-gray-600">
            Send your contribution directly to admin via M-Pesa
          </p>
        </div>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MdMoney className="inline mr-1" />
            Amount (KES)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MdPhone className="inline mr-1" />
            M-Pesa Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0712345678 or 254712345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              messageType === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !amount || !phoneNumber}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            loading || !amount || !phoneNumber
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Payment...
            </div>
          ) : (
            "Send Money via M-Pesa"
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Enter the amount you want to contribute</li>
          <li>2. Enter your M-Pesa registered phone number</li>
          <li>3. Click "Send Money via M-Pesa"</li>
          <li>4. You'll receive an M-Pesa prompt on your phone</li>
          <li>5. Enter your M-Pesa PIN to send money to the admin</li>
          <li>6. Your contribution will be automatically recorded</li>
        </ol>
        <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
          💡 <strong>Note:</strong> Money will be sent directly to the admin's
          M-Pesa number
        </div>
      </div>
    </div>
  );
};
