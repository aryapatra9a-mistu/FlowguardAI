
import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "https://flowguard-api-9j55.onrender.com";

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: {
          layout?: string;
          color?: string;
          shape?: string;
          label?: string;
        };
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: () => void;
        onError?: (error: unknown) => void;
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

type PaymentState =
  | "loading"
  | "ready"
  | "creating"
  | "capturing"
  | "success"
  | "failed";

export default function Payment() {
  const [customerName, setCustomerName] = useState("");
  const [state, setState] = useState<PaymentState>("loading");
  const [message, setMessage] = useState(
    "Loading PayPal Sandbox..."
  );
  const [orderId, setOrderId] = useState("");

  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const customerNameRef = useRef("");

  // ==================================================
  // INITIALIZE PAYPAL
  // ==================================================

  useEffect(() => {
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    async function initializePayPal() {
      try {
        const configResponse = await fetch(
          `${API_BASE_URL}/api/payments/paypal-config`
        );

        const config = await configResponse.json();

        if (!configResponse.ok || !config.client_id) {
          throw new Error(
            config.detail || "Could not load PayPal configuration."
          );
        }

        script = document.createElement("script");

        script.src =
          "https://www.paypal.com/sdk/js" +
          `?client-id=${encodeURIComponent(config.client_id)}` +
          `&currency=${encodeURIComponent(config.currency || "USD")}` +
          "&intent=capture";

        script.async = true;

        script.onload = async () => {
          if (
            cancelled ||
            !window.paypal ||
            !buttonContainerRef.current
          ) {
            return;
          }

          try {
            await window.paypal.Buttons({
              style: {
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "paypal"
              },

              // CREATE ORDER
              createOrder: async () => {
                const name = customerNameRef.current.trim();
                const accessToken = localStorage.getItem("access_token");

                if (!accessToken) {
                  setState("failed");
                  setMessage("Your session has expired. Please log in again.");
                  throw new Error("Authentication token is missing.");
                }

                if (!name) {
                  setState("failed");
                  setMessage("Enter your customer name first.");
                  throw new Error("Customer name is required.");
                }

                setState("creating");
                setMessage("Creating PayPal Sandbox order...");

                const response = await fetch(
                  `${API_BASE_URL}/api/payments/create-order`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                      customer_name: name
                    })
                  }
                );

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.detail || "Could not create PayPal order."
                  );
                }

                setOrderId(data.order_id);
                setState("ready");
                setMessage("Order created. Continue with PayPal.");

                return data.order_id;
              },

              // CAPTURE AND VERIFY PAYMENT
              onApprove: async (data) => {
                setState("capturing");
                setMessage("Capturing and verifying payment...");

                try {
                  const accessToken = localStorage.getItem("access_token");

                  if (!accessToken) {
                    throw new Error("Your session has expired. Please log in again.");
                  }
                  const response = await fetch(
                    `${API_BASE_URL}/api/payments/capture-order`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify({
                        order_id: data.orderID
                      })
                    }
                  );

                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(
                      result.detail || "Payment capture failed."
                    );
                  }

                  if (result.status === "Completed") {
                    setState("success");
                    setMessage(
                      "Payment successful! Your transaction is Completed."
                    );
                    setOrderId(
                      result.transaction_id || data.orderID
                    );
                  } else {
                    setState("failed");
                    setMessage(
                      result.message || "Payment is still pending."
                    );
                  }
                } catch (error) {
                  setState("failed");
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Payment verification failed."
                  );
                }
              },

              // PAYMENT CANCELLED
              onCancel: () => {
                setState("ready");
                setMessage("Payment was cancelled.");
              },

              // PAYPAL ERROR
              onError: (error) => {
                console.error("PayPal Checkout error:", error);
                setState("failed");
                setMessage(
                  "PayPal Checkout encountered an error. Please try again."
                );
              }
            }).render(buttonContainerRef.current);

            if (!cancelled) {
              setState("ready");
              setMessage(
                "Enter your name and pay using PayPal Sandbox."
              );
            }
          } catch (error) {
            if (!cancelled) {
              setState("failed");
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Could not display PayPal buttons."
              );
            }
          }
        };

        script.onerror = () => {
          if (!cancelled) {
            setState("failed");
            setMessage("Unable to load PayPal Checkout SDK.");
          }
        };

        document.body.appendChild(script);

      } catch (error) {
        if (!cancelled) {
          setState("failed");
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to initialize PayPal."
          );
        }
      }
    }

    initializePayPal();

    return () => {
      cancelled = true;

      if (script) {
        script.remove();
      }

      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  const busy =
    state === "loading" ||
    state === "creating" ||
    state === "capturing";

  // ==================================================
  // PAYMENT PAGE UI
  // ==================================================

  return (
    <main className="min-h-screen bg-[#05030b] px-4 py-10 text-white sm:px-6">

      <div className="mx-auto max-w-3xl">

        {/* BACK TO DASHBOARD BUTTON */}

        <div className="mb-7">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-purple-400 hover:bg-purple-500/20"
          >
            <span aria-hidden="true">←</span>
            Back to Dashboard
          </button>
        </div>

        {/* PAGE HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-300">
            FlowGuard AI · Payments
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            PayPal Checkout
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#D4D0E0]">
            Test your payment integration using PayPal Sandbox.
            No real money is charged.
          </p>

        </div>

        {/* PAYMENT CARD */}

        <section className="rounded-2xl border border-white/10 bg-[#100c1b] p-5 shadow-2xl shadow-purple-950/20 sm:p-8">

          {/* PAYMENT AMOUNT */}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>

              <p className="text-sm text-[#D4D0E0]">
                Sandbox payment amount
              </p>

              <p className="mt-1 text-4xl font-bold">
                $1.00
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Currency: USD
              </p>

            </div>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              PAYPAL SANDBOX
            </span>

          </div>

          {/* CUSTOMER NAME */}

          <label
            htmlFor="customerName"
            className="mb-2 block text-sm font-medium"
          >
            Customer name
          </label>

          <input
            id="customerName"
            type="text"
            value={customerName}
            maxLength={150}
            disabled={busy}
            onChange={(event) => {
              setCustomerName(event.target.value);
              customerNameRef.current = event.target.value;
            }}
            placeholder="Enter customer name"
            className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-purple-400 disabled:opacity-50"
          />

          {/* PAYPAL BUTTONS */}

          <div
            ref={buttonContainerRef}
            className="min-h-[50px]"
          />

          {/* LOADING MESSAGE */}

          {busy && (
            <p className="mt-4 text-center text-sm text-purple-300">
              {state === "loading"
                ? "Loading PayPal..."
                : state === "creating"
                ? "Creating order..."
                : "Capturing payment..."}
            </p>
          )}

          {/* PAYMENT STATUS */}

          {message && (
            <div
              role={state === "success" ? "status" : "alert"}
              className={`mt-5 break-words rounded-xl border p-4 text-sm leading-6 ${
                state === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : state === "failed"
                  ? "border-red-400/20 bg-red-400/10 text-red-200"
                  : "border-purple-400/20 bg-purple-400/10 text-purple-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* ORDER / TRANSACTION ID */}

          {orderId && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-[#D4D0E0]">

              <p className="break-all">

                <strong className="text-white">
                  Order / Transaction ID:
                </strong>{" "}

                {orderId}

              </p>

            </div>
          )}

        </section>

        {/* SANDBOX WARNING */}

        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-xs leading-5 text-amber-100">

          <strong>Testing only:</strong> This page is configured
          for PayPal Sandbox. Do not use it to accept real payments.

        </div>

        {/* BACKEND URL */}

        <p className="mt-6 text-center text-xs text-white/40">
          Backend API: {API_BASE_URL}
        </p>

      </div>

    </main>
  );
}
