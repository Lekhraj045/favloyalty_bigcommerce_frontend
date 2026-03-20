import { ChevronDown } from "lucide-react";
import React from "react";

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  isOpen,
  onClick,
}) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onClick}
        className="w-full p-3.5 flex justify-between items-center transition-colors cursor-pointer"
      >
        <span className="text-sm font-bold text-left">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-0">
          <p className="text-sm !text-[#303030] leading-relaxed">{children}</p>
        </div>
      )}
    </div>
  );
};

export default function PricingFaqsArea() {
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: "What is the Loyalty Program?",
      answer:
        "Our Loyalty Program rewards customers for their continued support. Members earn points with every purchase that can be redeemed for exclusive discounts, special offers, and more. It's designed to increase customer retention and lifetime value.",
    },
    {
      question: "How do Customers earn loyalty points?",
      answer:
        "Customers earn points through various actions: making purchases, referring friends, signing up for newsletters, celebrating birthdays, and engaging with your blog. The exact point values are customizable; you can easily calculate points center and redeeming values.",
    },
    {
      question: "How can customers redeem their 'loyalty points'?",
      answer:
        "Points can be redeemed for discounts in the next order (e.g., $1 flat discount/1 customer can easily redeem points will their checkout for triggering into their account. Customers can also unlock rewards like free products, exclusive offers and more through the points they earn.",
    },
    {
      question: "Do loyalty points expire?",
      answer:
        "Yes, loyalty points can expire if not used within the set expiration period. The expiration period differs from each point issuer, just before they expire.",
    },
    {
      question: "Is there a setup fee to implement the Loyalty Program?",
      answer:
        "No, there's no setup fee for either the Free or Pro plan. You can use membership.com immediately.",
    },
    {
      question: "Can customers combine points and discounts?",
      answer:
        "Yes, customers combine point based redemptions is 'fixed discount', and customers can discount coupon too. Beyond this rule, reward the customization plan and storage customers' point histories.",
    },
    {
      question: "How does the 'Pro' Tier plan work?",
      answer:
        "The Pro Tier plan offers advanced plan for higher tier different loyalty based on their points accumulation, loyalty tier in the enhanced rewards and benefits.",
    },
    {
      question: "What are 'Point Tiers and Levels' and how do they differ?",
      answer:
        "Point Tiers are structured levels that customers progress through as they accumulate points. Different tiers unlock rewards, discount codes, purchase, newsletter subscriptions, birthday, and item.",
    },
    {
      question: "Is a membership fee set up for all features for a campaign?",
      answer:
        "No, there's no membership fee required to use our platform. You can create campaigns, discounts, discount codes and more without any additional costs. However, there are add-ons like the Referrer that align with your campaign goals.",
    },
    {
      question: "How does the Birthday and Favorite follower discount?",
      answer:
        "Customers receive special offers on their birthday or when they achieve favorite follower status on their birthdays.",
    },
    {
      question:
        "How do I set up a Purchase Coupon as offer discounts via points?",
      answer:
        "You can configure rewards in the dashboard. Point-to-discount ratio can be customized based on your business goals and customer engagement.",
    },
    {
      question: "How does the direct installation stay within feature work?",
      answer:
        "Customers can be whitelisted directly, or assigned required access or discount.",
    },
    {
      question: "How does the free shipping rewards work?",
      answer:
        "Customers can redeem points for free shipping to encourage at cart to the certain points in the redemption settings.",
    },
    {
      question: "What is the purpose of points value?",
      answer:
        "The points value determines the monetary worth of each point and it essential for calculating discounts and rewards.",
    },
    {
      question: "Can I offer exclusive discounts to my best customers?",
      answer:
        "Absolutely! Invite these include tier, perks incentive, customize purchase requirement, or product exclusions.",
    },
    {
      question: "Can I exclude tier redemption for certain product's my brand?",
      answer:
        "Yes, you can customize reward rules, layouts, and settings to better your branding.",
    },
    {
      question: "Can I enable or disable specific Widget discounts?",
      answer:
        "Yes, you can customize each widget's settings to toggle visibility and features.",
    },
    {
      question: "Is integration required for enabling coupon?",
      answer:
        "No, additional integrations required. The app is built on email format/code.",
    },
    {
      question: "How do I set up rewards for my loyalty app?",
      answer:
        "Go to the email settings section to configure notification and triggers.",
    },
    {
      question: "Are email contents proofreads?",
      answer:
        "Yes, you check templates are provided, and you can also customize them.",
    },
    {
      question: "How do I manage campaigns and point settings?",
      answer:
        "Use the integrated management section to modify campaigns, issues, and features.",
    },
    {
      question: "Can I import customers?",
      answer:
        "Use the bulk import option to upload customer information via csv or suggested formats.",
    },
    {
      question: "How can I export customer data?",
      answer: "Use the free export option to download customer reports.",
    },
    {
      question: "Can I possibly upload and customers a period?",
      answer: "Yes, you can upload customer data and import information.",
    },
    {
      question: "What information is shown in a customer profile?",
      answer:
        "Customer profiles display purchase history, points earned, tier status and activity.",
    },
    {
      question: "How does the profile completion feature work?",
      answer:
        "It encourages users to complete their profile, allowing extra loyalty to profile points.",
    },
    {
      question: "How does the referral system work?",
      answer:
        "Customers earn points for successful referrals or earning or a purchase from referred person.",
    },
    {
      question: "How can I data exporting and redemption history?",
      answer: "View analytics section for the customer redemption history.",
    },
    {
      question: "How do access the customer support?",
      answer: "Use the integrated customer support section for assistance.",
    },
    {
      question:
        "Update your payment information via the Billing or Account Settings in Shopify.",
      answer:
        "Update your payment information via the Billing or Account Settings in Shopify.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "Accepted payment methods typically include credit cards, PayPal, and others.",
    },
    {
      question: "Can I change my subscription plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time.",
    },
    {
      question: "Is manual billing available?",
      answer: "Contact support for information about manual billing options.",
    },
    {
      question: "What happens after the trial? If this is important?",
      answer:
        "Your account will switch to the Free Plan. For fully featured use, we suggest one of the updates.",
    },
    {
      question: "Are all features available during the trial?",
      answer: "Yes, the trial includes access to all Pro features.",
    },
    {
      question: "What are the additional premium features?",
      answer:
        "Premium features include advanced analytics, custom branding, customized support, and more.",
    },
    {
      question: "How can I contact support?",
      answer:
        "You support is free and email at chat. Contact support@membership.com",
    },
    {
      question: "Does the loyalty program support multiple languages?",
      answer: "Not yet, but the feature is coming soon.",
    },
    {
      question: "What is Multi-Channel Loyalty?",
      answer:
        "Multi-channel loyalty allows you to manage separate loyalty programs for different channels, each with its own customers, rewards, and settings.",
    },
    {
      question: "Are customers shared across channels?",
      answer:
        "No, customers are channel-specific. A customer in one channel will not be automatically available in another channel.",
    },
    {
      question: "Do loyalty points sync across channels?",
      answer:
        "No, points are maintained separately for each channel and cannot be shared or transferred.",
    },
    {
      question: "Can the same customer join multiple channels?",
      answer:
        "Yes, but they will be treated as separate accounts in each channel.",
    },
    {
      question: "Can I run different loyalty programs on each channel?",
      html: (
        <div>
          <p>Yes, each channel can have its own:</p>
          <ul className="list-disc list-inside">
            <li>Points system</li>
            <li>Rewards</li>
            <li>Campaigns</li>
            <li>Rules</li>
          </ul>
        </div>
      ),
    },
    {
      question: "Are coupons and rewards shared across channels?",
      answer:
        "No, rewards and coupons are restricted to the channel they are created in",
    },
    {
      question: "Does each channel have its own widget?",
      answer:
        "Yes, each channel has its own widget configuration and display settings.",
    },
    {
      question: "How is customer data managed?",
      answer:
        "Customer data is stored separately per channel to ensure independent tracking and segmentation.",
    },
    {
      question: "Can I customize widget design per channel?",
      answer:
        "Yes, each channel can have a completely different widget design and behavior.",
    },
    {
      question: "Is analytics separated by channel?",
      answer:
        "Yes, analytics, reports, and performance metrics are tracked individually for each channel.",
    },
  ];

  return (
    <div className="mt-3 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Frequently Asked Questions
      </h2>

      <div className="bg-white rounded-lg border border-gray-200">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            title={faq.question}
            isOpen={openIndex === index}
            onClick={() =>
              setOpenIndex(openIndex === index ? null : (index as any))
            }
          >
            {faq.html ? faq.html : faq.answer}
          </AccordionItem>
        ))}
      </div>
    </div>
  );
}
