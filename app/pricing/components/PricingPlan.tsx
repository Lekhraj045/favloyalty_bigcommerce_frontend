import { Button } from '@heroui/button';
import { Check, X } from 'lucide-react';

interface PricingPlanAreaProps {
  orderCount: number;
  price: number;
}

export default function PricingPlanArea({ orderCount, price }: PricingPlanAreaProps) {
  const features = [
    { name: 'Monthly Order Limit', free: 'Up to 300', pro: '--' },
    { name: 'Additional order rate', free: '--', pro: '$5.00 / 100 orders*' },
    { name: 'Customer Summary', free: true, pro: true },
    { name: 'Tailored Communication', free: true, pro: true },
    { name: 'Loyalty Program Widget', free: true, pro: true },
    { name: 'Sign-up Bonus', free: true, pro: true },
    { name: 'Purchase Points', free: true, pro: true },
    { name: 'Birthday Treats', free: false, pro: true },
    { name: 'Referral Rewards', free: false, pro: true },
    { name: 'Newsletter Subscriptions', free: false, pro: true },
    { name: 'Rejoining Perks', free: false, pro: true },
    { name: 'Festivals and Events', free: false, pro: true },
    { name: 'Shipping Discounts', free: false, pro: true },
    { name: 'Flat Discounts', free: true, pro: true },
    { name: 'Free Products', free: false, pro: true },
    { name: 'Exclusive Coupons', free: false, pro: true },
    { name: 'Point Tiers and Levels', free: false, pro: true },
    { name: 'Redemption Restrictions', free: false, pro: true },
    { name: 'Points and Coupon Expiry', free: false, pro: true },
    { name: 'Customer Data Management', free: true, pro: true },
    { name: 'Onboarding Support', free: true, pro: true },
    { name: '24/7 Chat Support', free: true, pro: true },
  ];

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Core Features Column */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 h-[220px] min-height-[220px] border-b border-[#E0E0E0] sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-base font-bold">Core Loyalty Features</h2>
              <ul className="space-y-3 text-xs text-[#303030] mt-3.5">
                <li className="flex items-start">
                  <span className="mr-2">○</span>
                  <span>Collect points for purchases</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">○</span>
                  <span>Birthdays, referrals and special events</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">○</span>
                  <span>Redeem for discounts or free products</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">○</span>
                  <span>Manage through a simple dashboard, and access 24/7 support</span>
                </li>
              </ul>
            </div>

            <div>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-4 h-[45px] min-height-[45px] flex items-center ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} ${idx === features.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  <span className="text-[13px] text-[#303030]">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Free Plan Column */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 h-[220px] min-height-[220px] flex flex-col justify-between border-b border-[#E0E0E0] sticky top-0 bg-white rounded-t-xl">
              <div className="flex flex-col gap-2.5">
                <div>
                  <h3 className="text-base font-bold">Free</h3>
                  <p className="text-sm text-gray-600">Essential loyalty features.</p>
                </div>

                <div>
                  <span className="text-2xl font-bold text-[#303030]">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <div>
                <Button isDisabled className="custom-btn w-full">
                  Current Plan                  
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">&nbsp;</p>
              </div>
            </div>

            <div>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-4 h-[45px] min-height-[45px] flex items-center justify-center font-bold ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} ${idx === features.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Check className="w-5 h-5 text-teal-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )
                  ) : (
                    <span className="text-[13px] text-[#303030]">{feature.free}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan Column */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 h-[220px] min-height-[220px] flex flex-col justify-between border-b border-[#E0E0E0] sticky top-0 bg-white rounded-t-xl">
              <div className="flex flex-col gap-2.5">
                <div>
                  <h3 className="text-base font-bold">Pro</h3>
                  <p className="text-sm text-gray-600 mt-1">Base price + dynamic orders.</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-[#303030]">${price.toFixed(2)}</span>
                  <span className="text-gray-600">/month</span>
                  <p className="text-xs text-gray-500">Based on {orderCount.toLocaleString()} selected orders.</p>
                </div>
                
              </div>
              <div>
                <Button className="custom-btn w-full">
                  Upgrade to Pro (${price.toFixed(2)}/month)
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">Includes a 14-day free trial of all Pro features.</p>
              </div>
            </div>

            <div>
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`py-1 px-4 h-[45px] min-height-[45px] flex items-center justify-center font-bold ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'} ${idx === features.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? (
                      <Check className="w-5 h-5 text-teal-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )
                  ) : (
                    <span className="text-[13px] text-[#303030]">{feature.pro}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}