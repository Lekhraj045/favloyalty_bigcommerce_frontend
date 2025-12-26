import ToggleInputField from "./ToggleInputField";

interface WaysToEarnSectionProps {
  signUp: { enabled: boolean; points: string };
  everyPurchase: { enabled: boolean; points: string };
  birthday: { enabled: boolean; points: string };
  referEarn: { enabled: boolean; points: string };
  profileCompletion: { enabled: boolean; points: string };
  newsletter: { enabled: boolean; points: string };
  onSignUpChange: (enabled: boolean, points: string) => void;
  onEveryPurchaseChange: (enabled: boolean, points: string) => void;
  onBirthdayChange: (enabled: boolean, points: string) => void;
  onReferEarnChange: (enabled: boolean, points: string) => void;
  onProfileCompletionChange: (enabled: boolean, points: string) => void;
  onNewsletterChange: (enabled: boolean, points: string) => void;
}

export default function WaysToEarnSection({
  signUp,
  everyPurchase,
  birthday,
  referEarn,
  profileCompletion,
  newsletter,
  onSignUpChange,
  onEveryPurchaseChange,
  onBirthdayChange,
  onReferEarnChange,
  onProfileCompletionChange,
  onNewsletterChange,
}: WaysToEarnSectionProps) {
  return (
    <div className="card !p-0">
      <div className="flex flex-col gap-1 p-4 border-b border-[#DEDEDE]">
        <h2 className="text-base font-bold">Ways to Earn</h2>
        <p>Set ways to earn points.</p>
      </div>

      <div className="grid grid-cols-2 gap-8 p-4">
        <ToggleInputField
          label="Sign up"
          enabled={signUp.enabled}
          points={signUp.points}
          onToggleChange={(enabled) => onSignUpChange(enabled, signUp.points)}
          onPointsChange={(points) => onSignUpChange(signUp.enabled, points)}
        />

        <ToggleInputField
          label="Every purchase (Per INR spent)"
          enabled={everyPurchase.enabled}
          points={everyPurchase.points}
          onToggleChange={(enabled) =>
            onEveryPurchaseChange(enabled, everyPurchase.points)
          }
          onPointsChange={(points) =>
            onEveryPurchaseChange(everyPurchase.enabled, points)
          }
          inputType="float"
        />

        <ToggleInputField
          label="Birthday"
          enabled={birthday.enabled}
          points={birthday.points}
          onToggleChange={(enabled) =>
            onBirthdayChange(enabled, birthday.points)
          }
          onPointsChange={(points) =>
            onBirthdayChange(birthday.enabled, points)
          }
          tooltipContent="Customers receive birthday points upon entering their birthdate via the widget. Once set, the birthdate cannot be modified for a period of 365 days to prevent potential misuse."
        />

        <ToggleInputField
          label="Refer & Earn"
          enabled={referEarn.enabled}
          points={referEarn.points}
          onToggleChange={(enabled) =>
            onReferEarnChange(enabled, referEarn.points)
          }
          onPointsChange={(points) =>
            onReferEarnChange(referEarn.enabled, points)
          }
          tooltipContent="When a customer refers a friend: The friend gets points upon signing up, and customer will receive points after the friend makes their first purchase upon fullfillment of the order."
        />

        <ToggleInputField
          label="Profile Completion"
          enabled={profileCompletion.enabled}
          points={profileCompletion.points}
          onToggleChange={(enabled) =>
            onProfileCompletionChange(enabled, profileCompletion.points)
          }
          onPointsChange={(points) =>
            onProfileCompletionChange(profileCompletion.enabled, points)
          }
        />

        <ToggleInputField
          label="Subscribing to newsletter"
          enabled={newsletter.enabled}
          points={newsletter.points}
          onToggleChange={(enabled) =>
            onNewsletterChange(enabled, newsletter.points)
          }
          onPointsChange={(points) =>
            onNewsletterChange(newsletter.enabled, points)
          }
        />
      </div>
    </div>
  );
}

