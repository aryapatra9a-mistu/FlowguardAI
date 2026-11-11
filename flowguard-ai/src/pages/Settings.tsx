
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Wallet,
  Bell,
  Shield,
  Palette,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  LockKeyhole,
  Smartphone,
  Globe,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type PaymentMethod = "upi" | "paypal";

const API_BASE_URL = "https://flowguard-api-9j55.onrender.com";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  state: string;
  city: string;
}

interface BankData {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

interface PaymentData {
  method: PaymentMethod;
  upiId: string;
  paypalEmail: string;
}

interface Preferences {
  emailNotifications: boolean;
  fraudAlerts: boolean;
  transactionAlerts: boolean;
  weeklyReports: boolean;
  darkMode: boolean;
  fraudThreshold: number;
}

const defaultProfile: ProfileData = {
  name: "",
  email: "",
  phone: "",
  state: "",
  city: "",
};

const defaultBank: BankData = {
  accountHolder: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
};

const defaultPayment: PaymentData = {
  method: "upi",
  upiId: "",
  paypalEmail: "",
};

const defaultPreferences: Preferences = {
  emailNotifications: true,
  fraudAlerts: true,
  transactionAlerts: true,
  weeklyReports: false,
  darkMode: true,
  fraudThreshold: 70,
};

interface SettingsApiResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  settings: {
    profile?: Partial<ProfileData>;
    preferences?: Partial<Preferences>;
    payment?: Partial<PaymentData>;
    appearance?: {
      darkMode?: boolean;
    };
  };
}

export default function Settings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [bank, setBank] = useState<BankData>(defaultBank);
  const [payment, setPayment] = useState<PaymentData>(defaultPayment);
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  const [activeSection, setActiveSection] = useState("profile");
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Load the logged-in user's settings from the backend.
  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoadError("You are not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || `Request failed (${response.status})`);
        }

        const data: SettingsApiResponse = await response.json();

        if (cancelled) return;

        const savedSettings = data.settings ?? {};
        const savedProfile = savedSettings.profile ?? {};
        const savedPreferences = savedSettings.preferences ?? {};
        const savedPayment = savedSettings.payment ?? {};
        const savedAppearance = savedSettings.appearance ?? {};

        setProfile({
          name: data.user.name ?? "",
          email: data.user.email ?? "",
          phone: savedProfile.phone ?? "",
          state: savedProfile.state ?? "",
          city: savedProfile.city ?? "",
        });

        setPayment({
          ...defaultPayment,
          ...savedPayment,
        });

        setPreferences({
          ...defaultPreferences,
          ...savedPreferences,
          darkMode:
            savedAppearance.darkMode ??
            savedPreferences.darkMode ??
            defaultPreferences.darkMode,
        });

        // Bank details are intentionally not loaded from or saved to the API.
        setBank(defaultBank);

        // Keep the dashboard's existing name display in sync.
        localStorage.setItem("flowguard-user-name", data.user.name ?? "");
        window.dispatchEvent(
          new CustomEvent("flowguard-profile-updated", {
            detail: {
              name: data.user.name ?? "",
              email: data.user.email ?? "",
              phone: savedProfile.phone ?? "",
              state: savedProfile.state ?? "",
              city: savedProfile.city ?? "",
            },
          })
        );

        setLoadError("");
      } catch (error) {
        console.error("FlowGuard settings load error:", error);
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load your settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  // Reset the saved message whenever a setting changes.
  useEffect(() => {
    setSaved(false);
  }, [profile, bank, payment, preferences]);

  // PROFILE UPDATE
  const updateProfile = (
    field: keyof ProfileData,
    value: string
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // BANK UPDATE
  const updateBank = (
    field: keyof BankData,
    value: string
  ) => {
    setBank((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // PAYMENT UPDATE
  const updatePayment = (
    field: keyof PaymentData,
    value: string | PaymentMethod
  ) => {
    setPayment((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // PREFERENCES UPDATE
  const updatePreference = (
    field: keyof Preferences,
    value: boolean | number
  ) => {
    setPreferences((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  const saveSettings = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Your session has expired. Please log in again.");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const payload = {
        profile: {
          phone: profile.phone.trim(),
          state: profile.state.trim(),
          city: profile.city.trim(),
        },
        preferences: {
          emailNotifications: preferences.emailNotifications,
          fraudAlerts: preferences.fraudAlerts,
          transactionAlerts: preferences.transactionAlerts,
          weeklyReports: preferences.weeklyReports,
          fraudThreshold: preferences.fraudThreshold,
        },
        payment: {
          method: payment.method,
          upiId: payment.upiId.trim(),
          paypalEmail: payment.paypalEmail.trim(),
        },
        appearance: {
          darkMode: preferences.darkMode,
        },
      };

      const response = await fetch(`${API_BASE_URL}/api/settings/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status})`);
      }

      const result = await response.json();

      const profileToNotify = {
        ...profile,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        state: profile.state.trim(),
        city: profile.city.trim(),
      };

      localStorage.setItem("flowguard-user-name", profileToNotify.name);
      window.dispatchEvent(
        new CustomEvent("flowguard-profile-updated", {
          detail: profileToNotify,
        })
      );

      setSaved(true);
      console.info("FlowGuard settings saved:", result);
    } catch (error) {
      console.error("FlowGuard settings save error:", error);
      alert(
        error instanceof Error
          ? `Settings could not be saved: ${error.message}`
          : "Settings could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // SETTINGS SECTIONS
  // =========================================================

  const sections = [
    {
      id: "profile",
      label: "Profile",
      description: "Personal information",
      icon: UserRound,
    },
    {
      id: "bank",
      label: "Bank Details",
      description: "Bank account information",
      icon: Building2,
    },
    {
      id: "payment",
      label: "Payment Connection",
      description: "UPI or PayPal",
      icon: Wallet,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts and reports",
      icon: Bell,
    },
    {
      id: "security",
      label: "Fraud Detection",
      description: "Risk preferences",
      icon: Shield,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Dashboard preferences",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080610] text-white">
      <main className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-6 lg:p-8">

        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">
              <SettingsIcon size={14} />
              Account Configuration
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Manage your profile, payment preferences and security.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </header>

        {/* SAVE SUCCESS MESSAGE */}
        {saved && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            <CheckCircle2 size={17} />
            Settings saved successfully.
          </div>
        )}

        {loadError && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            Could not load settings from the backend: {loadError}
          </div>
        )}

        {loading && (
          <div
            role="status"
            className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-300"
          >
            Loading your account settings...
          </div>
        )}

        {/* SETTINGS LAYOUT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">

          {/* SIDEBAR */}
          <aside className="h-fit rounded-2xl border border-purple-500/20 bg-[#100b1b] p-3">
            <div className="px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Settings Menu
              </p>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const active = activeSection === section.id;

                return (
                  <button
                    type="button"
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "border border-purple-500/20 bg-purple-500/10 text-purple-300"
                        : "text-gray-400 hover:bg-white/[0.03] hover:text-gray-200"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-purple-400" : ""}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {section.label}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-500">
                        {section.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className={
                        active
                          ? "text-purple-400"
                          : "text-gray-600"
                      }
                    />
                  </button>
                );
              })}
            </nav>

            {/* PROFILE PREVIEW */}
            <div className="mt-4 border-t border-white/5 p-3">
              <p className="mb-3 text-[11px] uppercase tracking-wider text-gray-500">
                Profile Preview
              </p>

              <div className="flex items-center gap-3">
                <ProfileAvatar name={profile.name} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-200">
                    {profile.name.trim() || "Your Name"}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {profile.email || "Your email"}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN SETTINGS */}
          <div className="min-w-0 space-y-6">

            {/* =================================================
                PROFILE
            ================================================= */}
            {activeSection === "profile" && (
              <SettingsCard
                title="Personal Information"
                description="Update the information associated with your FlowGuard account."
                icon={UserRound}
              >
                <div className="mb-6 flex flex-col gap-4 rounded-xl border border-purple-500/15 bg-purple-500/[0.04] p-4 sm:flex-row sm:items-center">
                  <ProfileAvatar name={profile.name} large />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {profile.name.trim() || "Your Profile"}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Your dashboard profile icon updates using your saved name.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Full Name"
                    icon={UserRound}
                    value={profile.name}
                    placeholder="Your account name"
                    readOnly
                    onChange={(value) =>
                      updateProfile("name", value)
                    }
                  />

                  <FormField
                    label="Email Address"
                    icon={Mail}
                    value={profile.email}
                    placeholder="you@example.com"
                    type="email"
                    readOnly
                    onChange={(value) =>
                      updateProfile("email", value)
                    }
                  />

                  <FormField
                    label="Contact Number"
                    icon={Phone}
                    value={profile.phone}
                    placeholder="+91 98765 43210"
                    type="tel"
                    onChange={(value) =>
                      updateProfile("phone", value)
                    }
                  />

                  <FormField
                    label="State"
                    icon={MapPin}
                    value={profile.state}
                    placeholder="Enter your state"
                    onChange={(value) =>
                      updateProfile("state", value)
                    }
                  />

                  <FormField
                    label="City"
                    icon={MapPin}
                    value={profile.city}
                    placeholder="Enter your city"
                    onChange={(value) =>
                      updateProfile("city", value)
                    }
                  />
                </div>

                <div className="mt-5 rounded-xl border border-white/5 bg-[#090611] p-4">
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={17}
                      className="mt-0.5 text-purple-400"
                    />

                    <div>
                      <p className="text-xs font-medium text-gray-300">
                        Profile privacy
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Your account name and email come from your FlowGuard
                        login. Phone, state and city are saved to your account
                        through the authenticated backend API.
                      </p>
                    </div>
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* =================================================
                BANK DETAILS
            ================================================= */}
            {activeSection === "bank" && (
              <SettingsCard
                title="Bank Account Details"
                description="Preview fields only — bank details are not saved."
                icon={Building2}
              >
                <div className="mb-5 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <Shield
                      size={17}
                      className="mt-0.5 text-amber-400"
                    />

                    <div>
                      <p className="text-xs font-medium text-amber-300">
                        Demo information only
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        This section is a visual demo only. Bank account
                        numbers and IFSC codes are not sent to the backend
                        or stored. Do not enter real banking information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Account Holder Name"
                    icon={UserRound}
                    value={bank.accountHolder}
                    placeholder="Account holder name"
                    onChange={(value) =>
                      updateBank("accountHolder", value)
                    }
                  />

                  <FormField
                    label="Bank Name"
                    icon={Building2}
                    value={bank.bankName}
                    placeholder="Enter bank name"
                    onChange={(value) =>
                      updateBank("bankName", value)
                    }
                  />

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-gray-400">
                      Account Number
                    </label>

                    <div className="relative">
                      <CreditCard
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />

                      <input
                        value={bank.accountNumber}
                        onChange={(event) =>
                          updateBank(
                            "accountNumber",
                            event.target.value
                          )
                        }
                        type={
                          showAccountNumber
                            ? "text"
                            : "password"
                        }
                        placeholder="Enter account number"
                        className="w-full rounded-xl border border-white/10 bg-[#090611] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowAccountNumber(
                            (previous) => !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-300"
                        aria-label={
                          showAccountNumber
                            ? "Hide account number"
                            : "Show account number"
                        }
                      >
                        {showAccountNumber ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <FormField
                    label="IFSC Code"
                    icon={Shield}
                    value={bank.ifsc}
                    placeholder="Example: ABCD0123456"
                    onChange={(value) =>
                      updateBank("ifsc", value.toUpperCase())
                    }
                  />
                </div>
              </SettingsCard>
            )}

            {/* =================================================
                PAYMENT CONNECTION
            ================================================= */}
            {activeSection === "payment" && (
              <SettingsCard
                title="Payment Connection"
                description="Choose one payment method for this prototype."
                icon={Wallet}
              >
                <div className="mb-5 rounded-xl border border-purple-500/15 bg-purple-500/[0.04] p-4">
                  <p className="text-xs leading-5 text-gray-400">
                    Your selected method and entered identifier are saved
                    to your FlowGuard account. This does not verify or connect
                    a UPI or PayPal account and does not process payments.
                  </p>
                </div>

                {/* METHOD CHOICE */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PaymentChoice
                    selected={payment.method === "upi"}
                    title="UPI"
                    description="Use a UPI ID"
                    icon={Smartphone}
                    onClick={() =>
                      updatePayment("method", "upi")
                    }
                  />

                  <PaymentChoice
                    selected={payment.method === "paypal"}
                    title="PayPal"
                    description="Use a PayPal email"
                    icon={Globe}
                    onClick={() =>
                      updatePayment("method", "paypal")
                    }
                  />
                </div>

                {/* UPI FORM */}
                {payment.method === "upi" && (
                  <div className="mt-6 rounded-xl border border-purple-500/15 bg-[#090611] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Smartphone
                        size={18}
                        className="text-purple-400"
                      />

                      <h3 className="text-sm font-semibold">
                        UPI Details
                      </h3>
                    </div>

                    <FormField
                      label="UPI ID"
                      icon={Wallet}
                      value={payment.upiId}
                      placeholder="example@upi"
                      onChange={(value) =>
                        updatePayment("upiId", value)
                      }
                    />

                    <p className="mt-3 text-xs text-gray-500">
                      Example format: name@bank
                    </p>
                  </div>
                )}

                {/* PAYPAL FORM */}
                {payment.method === "paypal" && (
                  <div className="mt-6 rounded-xl border border-blue-500/15 bg-[#090611] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Globe
                        size={18}
                        className="text-blue-400"
                      />

                      <h3 className="text-sm font-semibold">
                        PayPal Details
                      </h3>
                    </div>

                    <FormField
                      label="PayPal Email"
                      icon={Mail}
                      value={payment.paypalEmail}
                      type="email"
                      placeholder="your-paypal@example.com"
                      onChange={(value) =>
                        updatePayment("paypalEmail", value)
                      }
                    />
                  </div>
                )}
              </SettingsCard>
            )}

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}
            {activeSection === "notifications" && (
              <SettingsCard
                title="Notification Preferences"
                description="Choose which updates you want to receive."
                icon={Bell}
              >
                <div className="space-y-3">
                  <ToggleRow
                    title="Email Notifications"
                    description="Receive account updates by email."
                    checked={preferences.emailNotifications}
                    onChange={(value) =>
                      updatePreference(
                        "emailNotifications",
                        value
                      )
                    }
                  />

                  <ToggleRow
                    title="Fraud Alerts"
                    description="Get notified about suspicious activity."
                    checked={preferences.fraudAlerts}
                    onChange={(value) =>
                      updatePreference("fraudAlerts", value)
                    }
                  />

                  <ToggleRow
                    title="Transaction Alerts"
                    description="Receive updates about transaction activity."
                    checked={preferences.transactionAlerts}
                    onChange={(value) =>
                      updatePreference(
                        "transactionAlerts",
                        value
                      )
                    }
                  />

                  <ToggleRow
                    title="Weekly Reports"
                    description="Enable a weekly activity summary preference."
                    checked={preferences.weeklyReports}
                    onChange={(value) =>
                      updatePreference("weeklyReports", value)
                    }
                  />
                </div>
              </SettingsCard>
            )}

            {/* =================================================
                FRAUD DETECTION
            ================================================= */}
            {activeSection === "security" && (
              <SettingsCard
                title="Fraud Detection"
                description="Configure the demo fraud risk preferences."
                icon={Shield}
              >
                <div className="rounded-xl border border-purple-500/15 bg-purple-500/[0.04] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        Risk Alert Threshold
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Demo threshold: {preferences.fraudThreshold}%
                      </p>
                    </div>

                    <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-300">
                      {preferences.fraudThreshold}%
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={preferences.fraudThreshold}
                    onChange={(event) =>
                      updatePreference(
                        "fraudThreshold",
                        Number(event.target.value)
                      )
                    }
                    className="mt-6 w-full accent-purple-500"
                  />

                  <div className="mt-2 flex justify-between text-[11px] text-gray-500">
                    <span>1% · Sensitive</span>
                    <span>100% · Less sensitive</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/5 bg-[#090611] p-4">
                  <div className="flex items-start gap-3">
                    <Shield
                      size={17}
                      className="text-purple-400"
                    />

                    <div>
                      <p className="text-xs font-medium text-gray-300">
                        Risk configuration
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        This threshold is saved to your account as a
                        preference. It does not currently change the live
                        fraud detection model.
                      </p>
                    </div>
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* =================================================
                APPEARANCE
            ================================================= */}
            {activeSection === "appearance" && (
              <SettingsCard
                title="Appearance"
                description="Customize your dashboard experience."
                icon={Palette}
              >
                <ToggleRow
                  title="Dark Mode"
                  description="Keep the dark FlowGuard interface enabled."
                  checked={preferences.darkMode}
                  onChange={(value) =>
                    updatePreference("darkMode", value)
                  }
                />

                <div className="mt-5 rounded-xl border border-purple-500/15 bg-[#090611] p-5">
                  <p className="text-xs font-medium text-gray-400">
                    Accent Color
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <AccentPreview
                      color="bg-purple-500"
                      label="Purple"
                      active
                    />

                    <AccentPreview
                      color="bg-blue-500"
                      label="Blue"
                    />

                    <AccentPreview
                      color="bg-fuchsia-500"
                      label="Fuchsia"
                    />
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    Purple is the current visual style for this prototype.
                  </p>
                </div>
              </SettingsCard>
            )}

            {/* =================================================
                SAVE FOOTER
            ================================================= */}
            <div className="flex flex-col gap-3 rounded-2xl border border-purple-500/20 bg-[#100b1b] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-sm font-semibold">
                  Save your changes
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your supported settings are saved to your FlowGuard account.
                </p>
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving || loading}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  saved
                    ? "bg-emerald-600 hover:bg-emerald-500"
                    : "bg-purple-600 hover:bg-purple-500"
                }`}
              >
                {saving ? (
                  <>
                    <Save size={16} />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 size={16} />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SETTINGS CARD
========================================================= */

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-purple-500/20 bg-[#100b1b]">
      <div className="flex items-start gap-3 border-b border-white/5 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-base font-semibold">{title}</h2>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  icon: Icon,
  value,
  placeholder,
  onChange,
  type = "text",
  readOnly = false,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-white/10 bg-[#090611] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/50 ${
            readOnly ? "cursor-not-allowed opacity-70" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE AVATAR
========================================================= */

function ProfileAvatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-500/25 to-fuchsia-500/10 font-bold text-purple-300 ${
        large
          ? "h-14 w-14 text-lg"
          : "h-10 w-10 text-xs"
      }`}
    >
      {initials || "FG"}
    </div>
  );
}

/* =========================================================
   PAYMENT CHOICE
========================================================= */

function PaymentChoice({
  selected,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-purple-500/40 bg-purple-500/10"
          : "border-white/10 bg-[#090611] hover:border-purple-500/25"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-purple-500/15 text-purple-300"
            : "bg-white/5 text-gray-400"
        }`}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
          selected
            ? "border-purple-400 bg-purple-500"
            : "border-gray-600"
        }`}
      >
        {selected && (
          <CheckCircle2
            size={12}
            className="text-white"
          />
        )}
      </div>
    </button>
  );
}

/* =========================================================
   TOGGLE ROW
========================================================= */

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#090611] p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-200">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-purple-600" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* =========================================================
   ACCENT PREVIEW
========================================================= */

function AccentPreview({
  color,
  label,
  active = false,
}: {
  color: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        active
          ? "border-purple-500/30 bg-purple-500/10"
          : "border-white/5 bg-white/[0.02]"
      }`}
    >
      <span className={`h-3 w-3 rounded-full ${color}`} />

      <span className="text-xs text-gray-300">
        {label}
      </span>

      {active && (
        <CheckCircle2
          size={13}
          className="text-purple-400"
        />
      )}
    </div>
  );
}
