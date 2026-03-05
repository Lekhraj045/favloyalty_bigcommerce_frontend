"use client";

import ChannelSelector from "@/components/ChannelSelector";
import UpgradeModal from "@/components/UpgradeModal";
import { useAppSelector } from "@/store/hooks";
import {
  getCollectSettings,
  getEmailTemplateByType,
  getStoreId,
  getStorePlan,
  saveCollectSettings,
  updateEmailTemplate,
  type EmailTemplate,
  type StorePlan,
} from "@/utils/api";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Switch } from "@heroui/switch";
import { Pencil, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useRef as ReactUseRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface EmailNotification {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
}

// Helper function to parse HTML and extract heading, description, and button text
// This is used ONLY for initial extraction when loading a template
// The extracted values are stored as separate state and never modify the original HTML
const parseEmailBody = (
  html: string,
): { heading: string; description: string; buttonText: string } => {
  if (!html) return { heading: "", description: "", buttonText: "" };

  try {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract heading from h1 tag - try multiple selectors
    let headingElement = doc.querySelector("#u_content_heading_1 h1");
    if (!headingElement) {
      headingElement = doc.querySelector("h1");
    }
    const heading = headingElement ? headingElement.innerHTML.trim() : "";

    // Extract description from p tag - try multiple selectors
    let descriptionElement = doc.querySelector("#u_content_text_1 p");
    if (!descriptionElement) {
      descriptionElement = doc.querySelector("#u_content_text_1 div p");
    }
    if (!descriptionElement) {
      // Find the first p tag that's not in the heading section
      const allP = doc.querySelectorAll("p");
      for (let i = 0; i < allP.length; i++) {
        const p = allP[i];
        if (!p.closest("#u_content_heading_1") && !p.closest("h1")) {
          descriptionElement = p;
          break;
        }
      }
    }
    const description = descriptionElement
      ? descriptionElement.innerHTML.trim()
      : "";

    // Extract button text from u_content_button_1
    let buttonElement = doc.querySelector("#u_content_button_1 a span span");
    if (!buttonElement) {
      buttonElement = doc.querySelector("#u_content_button_1 a span");
    }
    if (!buttonElement) {
      buttonElement = doc.querySelector("#u_content_button_1 a");
    }
    const buttonText = buttonElement
      ? buttonElement.textContent?.trim() || buttonElement.innerHTML.trim()
      : "";

    return { heading, description, buttonText };
  } catch (error) {
    console.error("Error parsing email body:", error);
    return { heading: "", description: "", buttonText: "" };
  }
};

// Helper function to update text content in an element while preserving all DOM structure and inline styles
// Uses TreeWalker to find and update only the deepest text node
const updateTextNodePreservingStructure = (
  element: Element,
  newText: string,
  doc: Document,
): void => {
  if (!element) return;

  // Extract plain text from HTML if provided (ReactQuill may provide HTML)
  const tempDiv = doc.createElement("div");
  tempDiv.innerHTML = newText;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";

  // Use TreeWalker to find all text nodes
  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  const textNodes: Text[] = [];
  let node: Node | null = walker.nextNode();

  // Collect all text nodes
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  if (textNodes.length > 0) {
    // Update the deepest (last) text node with new content
    // This preserves all nested spans, classes, and inline styles
    const deepestTextNode = textNodes[textNodes.length - 1];
    deepestTextNode.nodeValue = textContent;

    // Clear all other text nodes to avoid duplication
    for (let i = 0; i < textNodes.length - 1; i++) {
      textNodes[i].nodeValue = "";
    }
  } else {
    // If no text node exists, append a single text node
    // This preserves all existing child elements and structure
    const textNode = doc.createTextNode(textContent);
    element.appendChild(textNode);
  }
};

// Helper function to replace content while preserving outer styling spans with font-size
// This preserves font-size styles from the original structure while allowing ReactQuill HTML
const replaceContentPreservingOuterStyles = (
  element: Element,
  newHtml: string,
  doc: Document,
): void => {
  if (!element) return;

  // Check if element has direct child spans with font-size styles
  const directChildren = Array.from(element.children);
  const styledSpans = directChildren.filter(
    (child) =>
      child.tagName === "SPAN" &&
      child.getAttribute("style")?.includes("font-size"),
  );

  if (styledSpans.length > 0) {
    // If there are direct child spans with font-size, replace the content of the first one
    // This preserves the outer span wrapper with font-size styles
    styledSpans[0].innerHTML = newHtml;
  } else {
    // Check for nested spans with font-size (one level deep)
    for (const child of directChildren) {
      const nestedSpans = Array.from(child.children).filter(
        (nested) =>
          nested.tagName === "SPAN" &&
          nested.getAttribute("style")?.includes("font-size"),
      );
      if (nestedSpans.length > 0) {
        // Replace content of the nested span, preserving outer structure
        nestedSpans[0].innerHTML = newHtml;
        return;
      }
    }

    // No styled spans found, replace innerHTML directly
    // This handles cases where the structure is simpler
    element.innerHTML = newHtml;
  }
};

// Helper function to reconstruct HTML with edited values while preserving structure
// This updates ONLY text nodes, preserving all spans, classes, and inline styles
const reconstructEmailBody = (
  heading: string,
  description: string,
  buttonText: string,
  originalBody: string,
): string => {
  if (!originalBody) {
    // If no original body, return empty string (shouldn't happen in practice)
    return "";
  }

  try {
    // Parse the original HTML
    const wrappedHtml = `<div id="temp-wrapper">${originalBody}</div>`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(wrappedHtml, "text/html");
    const wrapper = doc.getElementById("temp-wrapper");

    if (!wrapper) {
      return originalBody;
    }

    // Update heading - preserve outer spans with font-size while updating content
    let headingElement = wrapper.querySelector("#u_content_heading_1 h1");
    if (!headingElement) {
      headingElement = wrapper.querySelector("h1");
    }
    if (headingElement && heading) {
      // Use helper to preserve font-size styles while allowing ReactQuill HTML (line breaks, formatting)
      replaceContentPreservingOuterStyles(headingElement, heading, doc);
    }

    // Update description - preserve outer spans with font-size while updating content
    let descriptionElement = wrapper.querySelector("#u_content_text_1 p");
    if (!descriptionElement) {
      descriptionElement = wrapper.querySelector("#u_content_text_1 div p");
    }
    if (!descriptionElement) {
      // Find the first p tag that's not in the heading section
      const allP = wrapper.querySelectorAll("p");
      for (let i = 0; i < allP.length; i++) {
        const p = allP[i];
        if (!p.closest("#u_content_heading_1") && !p.closest("h1")) {
          descriptionElement = p;
          break;
        }
      }
    }
    if (descriptionElement && description) {
      // Use helper to preserve font-size styles while allowing ReactQuill HTML (line breaks, formatting)
      replaceContentPreservingOuterStyles(descriptionElement, description, doc);
    }

    // Update button text - try multiple selectors
    let buttonElement = wrapper.querySelector(
      "#u_content_button_1 a span span",
    );
    if (!buttonElement) {
      buttonElement = wrapper.querySelector("#u_content_button_1 a span");
    }
    if (!buttonElement) {
      buttonElement = wrapper.querySelector("#u_content_button_1 a");
    }
    if (buttonElement && buttonText) {
      // Update the innermost span or the button element itself
      if (buttonElement.tagName === "SPAN") {
        updateTextNodePreservingStructure(buttonElement, buttonText, doc);
      } else if (buttonElement.tagName === "A") {
        const innerSpan =
          buttonElement.querySelector("span span") ||
          buttonElement.querySelector("span");
        if (innerSpan) {
          updateTextNodePreservingStructure(innerSpan, buttonText, doc);
        } else {
          // If no span exists, append a text node to preserve structure
          const textNode = doc.createTextNode(buttonText);
          buttonElement.appendChild(textNode);
        }
      }
    }

    // Return the innerHTML of the wrapper (structure preserved, only text nodes updated)
    return wrapper.innerHTML;
  } catch (error) {
    console.error("Error reconstructing email body:", error);
    return originalBody;
  }
};

// Email Body Editor Component
interface EmailBodyEditorProps {
  headingValue: string;
  descriptionValue: string;
  buttonValue: string;
  onHeadingChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onButtonChange: (value: string) => void;
  templateOptions: string[];
}

const EmailBodyEditor = ({
  headingValue,
  descriptionValue,
  buttonValue,
  onHeadingChange,
  onDescriptionChange,
  onButtonChange,
  templateOptions,
}: EmailBodyEditorProps) => {
  const [showVariablesDropdown, setShowVariablesDropdown] = useState(false);
  const [activeBlock, setActiveBlock] = useState<
    "heading" | "description" | "button" | null
  >(null);
  const headingQuillRef = ReactUseRef<any>(null);
  const descriptionQuillRef = ReactUseRef<any>(null);

  // Custom toolbar configuration matching the screenshot
  const modules = useMemo(() => {
    const toolbarContainer = [
      ["bold", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
    ];

    return {
      toolbar: {
        container: toolbarContainer,
      },
    };
  }, []);

  const formats = [
    "bold",
    "underline",
    "strike",
    "color",
    "background",
    "align",
  ];

  const insertVariable = (
    variable: string,
    blockType: "heading" | "description",
  ) => {
    const quillRef =
      blockType === "heading" ? headingQuillRef : descriptionQuillRef;
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      if (range) {
        quill.insertText(range.index, variable, "user");
        quill.setSelection(range.index + variable.length);
      } else {
        // If no selection, insert at the end
        const length = quill.getLength();
        quill.insertText(length - 1, variable, "user");
        quill.setSelection(length - 1 + variable.length);
      }
    }
    setShowVariablesDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVariablesDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest(".variables-dropdown-container")) {
          setShowVariablesDropdown(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVariablesDropdown]);

  return (
    <div className="flex flex-col gap-4">
      {/* Heading Block */}
      <div
        className={`border-2 rounded-md transition-colors ${activeBlock === "heading" ? "border-blue-500" : "border-gray-200"}`}
        onClick={() => setActiveBlock("heading")}
      >
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Heading</span>
          <div className="relative variables-dropdown-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVariablesDropdown(!showVariablesDropdown);
                setActiveBlock("heading");
              }}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            >
              Insert Variables
              <span className="text-xs">▼</span>
            </button>
            {showVariablesDropdown && activeBlock === "heading" && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
                {templateOptions.length > 0 ? (
                  templateOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        insertVariable(option, "heading");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No variables available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white">
          <ReactQuill
            ref={headingQuillRef}
            theme="snow"
            value={headingValue}
            onChange={onHeadingChange}
            modules={modules}
            formats={formats}
            style={{
              minHeight: "100px",
              border: "none",
            }}
          />
        </div>
      </div>

      {/* Description Block */}
      <div
        className={`border-2 rounded-md transition-colors ${activeBlock === "description" ? "border-blue-500" : "border-gray-200"}`}
        onClick={() => setActiveBlock("description")}
      >
        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Description</span>
          <div className="relative variables-dropdown-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowVariablesDropdown(!showVariablesDropdown);
                setActiveBlock("description");
              }}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1"
            >
              Insert Variables
              <span className="text-xs">▼</span>
            </button>
            {showVariablesDropdown && activeBlock === "description" && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
                {templateOptions.length > 0 ? (
                  templateOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        insertVariable(option, "description");
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No variables available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white">
          <ReactQuill
            ref={descriptionQuillRef}
            theme="snow"
            value={descriptionValue}
            onChange={onDescriptionChange}
            modules={modules}
            formats={formats}
            style={{
              minHeight: "150px",
              border: "none",
            }}
          />
        </div>
      </div>

      {/* Button Block */}
      <div
        className={`border-2 rounded-md transition-colors bg-white ${activeBlock === "button" ? "border-blue-500" : "border-gray-200"}`}
        onClick={() => setActiveBlock("button")}
        style={{
          padding: "30px 20px",
          minHeight: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="relative" style={{ display: "inline-block" }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const text = e.currentTarget.textContent || "";
              onButtonChange(text);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            style={{
              boxSizing: "border-box",
              display: "inline-block",
              textAlign: "center",
              color: "#ffffff",
              backgroundColor: "#ef3f42",
              borderRadius: "4px",
              padding: "10px 20px",
              fontSize: "14px",
              lineHeight: "120%",
              border: "none",
              cursor: "text",
              minWidth: "120px",
              outline: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveBlock("button");
            }}
          >
            {buttonValue || "Button Text"}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mapping between frontend keys and backend emailSetting keys
const EMAIL_KEY_MAP: Record<string, string> = {
  signUp: "signUp",
  purchase: "purchase",
  birthday: "birthday",
  couponExpire: "couponExpire",
  festival: "festival",
  monthlyPoints: "monthlyPoints",
  newsletter: "newsletter",
  pointsExpire: "pointsExpire",
  profileCompletion: "profileCompletion",
  referAndEarn: "referAndEarn",
  rejoining: "rejoining",
  upgradedTrial: "upgradedTrial",
};

export default function EmailsPage() {
  const { selectedChannel } = useAppSelector((state) => state.channel);
  const [storePlan, setStorePlan] = useState<StorePlan | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [restrictedFeatureName, setRestrictedFeatureName] =
    useState<string>("");
  const hasDisabledRestrictedEmailsRef = useRef<boolean>(false);

  const router = useRouter();

  // Helper function to check if user is on free plan or order limit reached
  const isFreePlan = () => {
    return storePlan?.plan === "free" || storePlan?.limitReached === true;
  };

  // Helper function to show upgrade modal for a specific feature
  const showUpgradeModalForFeature = (featureName: string) => {
    setRestrictedFeatureName(featureName);
    setShowUpgradeModal(true);
  };

  // Helper function to check if an email is restricted for free users
  // Only "signUp" and "purchase" are accessible for free users
  const isRestrictedEmail = (emailKey: string) => {
    if (!isFreePlan()) return false;
    return emailKey !== "signUp" && emailKey !== "purchase";
  };

  const [emailNotifications, setEmailNotifications] = useState<
    EmailNotification[]
  >([
    {
      key: "signUp",
      label: "Welcome to Our Loyalty Program",
      icon: "/images/signup-notifaction.svg",
      enabled: false,
    },
    {
      key: "purchase",
      label: "Points On Order Fulfillment Notification",
      icon: "/images/purchase-notifation.svg",
      enabled: false,
    },
    {
      key: "birthday",
      label: "Birthday Rewards Notification",
      icon: "/images/birthday-notification.svg",
      enabled: false,
    },
    {
      key: "couponExpire",
      label: "Coupon Expiration Alert",
      icon: "/images/coupon-expire-notification.svg",
      enabled: false,
    },
    {
      key: "festival",
      label: "Festival Celebration Rewards",
      icon: "/images/festival-notification.svg",
      enabled: false,
    },
    {
      key: "monthlyPoints",
      label: "Monthly Points Statement",
      icon: "/images/monthly-expire-notification.svg",
      enabled: false,
    },
    {
      key: "newsletter",
      label: "Loyalty Program Newsletter",
      icon: "/images/newsletter-notification.svg",
      enabled: false,
    },
    {
      key: "pointsExpire",
      label: "Points Expiration Notification",
      icon: "/images/point-expire-notification.svg",
      enabled: false,
    },
    {
      key: "profileCompletion",
      label: "Profile Completion Reward",
      icon: "/images/profile-complete-notification.svg",
      enabled: false,
    },
    {
      key: "referAndEarn",
      label: "Refer & Earn Rewards",
      icon: "/images/refer-earn-notification.svg",
      enabled: false,
    },
    {
      key: "rejoining",
      label: "Welcome Back Rewards",
      icon: "/images/rejoining-notification.svg",
      enabled: false,
    },
    {
      key: "upgradedTrial",
      label: "Tier Upgrade Notification",
      icon: "/images/upgrade-trial-notification.svg",
      enabled: false,
    },
  ]);

  const [selectedEmail, setSelectedEmail] = useState<string>("festival");
  const [loading, setLoading] = useState<boolean>(true);
  const [savingEmailKey, setSavingEmailKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [emailHeading, setEmailHeading] = useState<string>("");
  const [savingTemplate, setSavingTemplate] = useState<boolean>(false);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(
    null,
  );
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState<string>("");
  const [originalEmailBody, setOriginalEmailBody] = useState<string>("");
  const [emailHeadingText, setEmailHeadingText] = useState<string>("");
  const [emailDescriptionText, setEmailDescriptionText] = useState<string>("");
  const [emailButtonText, setEmailButtonText] = useState<string>("");
  const [originalHeadingText, setOriginalHeadingText] = useState<string>("");
  const [originalDescriptionText, setOriginalDescriptionText] =
    useState<string>("");
  const [originalButtonText, setOriginalButtonText] = useState<string>("");

  // Load store plan information
  useEffect(() => {
    const loadStorePlan = async () => {
      try {
        const plan = await getStorePlan();
        setStorePlan(plan);
      } catch (error) {
        console.error("Error loading store plan:", error);
        // Default to free plan if error
        setStorePlan({
          plan: "free",
          trialDaysRemaining: null,
          paypalSubscriptionId: null,
          limitReached: false,
          orderCount: 0,
          selectedOrderLimit: 0,
        });
      }
    };
    loadStorePlan();
  }, []);

  // Auto-disable restricted emails if free user has them enabled
  useEffect(() => {
    if (!isFreePlan() || loading || hasDisabledRestrictedEmailsRef.current) {
      return;
    }

    // Check if any restricted emails are enabled
    const hasRestrictedEnabled = emailNotifications.some(
      (email) => isRestrictedEmail(email.key) && email.enabled,
    );

    if (hasRestrictedEnabled) {
      // Disable all restricted emails
      const storeId = getStoreId();
      const channelId = selectedChannel?.id;

      if (storeId && channelId) {
        const disableRestrictedEmails = async () => {
          try {
            // Fetch current settings
            const currentSettings = await getCollectSettings(
              storeId,
              channelId,
            );

            // Prepare updated email settings with restricted emails disabled
            const updatedEmailSetting = {
              ...(currentSettings?.emailSetting || {}),
            };

            emailNotifications.forEach((email) => {
              if (isRestrictedEmail(email.key)) {
                const backendKey = EMAIL_KEY_MAP[email.key];
                updatedEmailSetting[backendKey] = {
                  enable: false,
                  id: currentSettings?.emailSetting?.[backendKey]?.id || null,
                };
              }
            });

            // Save to backend
            await saveCollectSettings(storeId, channelId, {
              emailSetting: updatedEmailSetting,
            });

            // Update local state
            setEmailNotifications((prev) =>
              prev.map((email) =>
                isRestrictedEmail(email.key)
                  ? { ...email, enabled: false }
                  : email,
              ),
            );

            hasDisabledRestrictedEmailsRef.current = true;
          } catch (err) {
            console.error("Error disabling restricted emails:", err);
          }
        };

        disableRestrictedEmails();
      }
    }
  }, [storePlan, loading, emailNotifications, selectedChannel?.id]);

  // Fetch email settings from backend on mount
  useEffect(() => {
    const fetchEmailSettings = async () => {
      const storeId = getStoreId();
      const channelId = selectedChannel?.id;

      if (!storeId || !channelId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const settings = await getCollectSettings(storeId, channelId);

        if (settings && settings.emailSetting) {
          // Map backend email settings to frontend notifications
          setEmailNotifications((prev) =>
            prev.map((email) => {
              const backendKey = EMAIL_KEY_MAP[email.key];
              const emailSetting = settings.emailSetting[backendKey];
              return {
                ...email,
                enabled: emailSetting?.enable || false,
              };
            }),
          );
        }
      } catch (err) {
        console.error("Error fetching email settings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load email settings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmailSettings();
  }, [selectedChannel?.id]);

  // Fetch email template when selected email changes
  useEffect(() => {
    const fetchEmailTemplate = async () => {
      const storeId = getStoreId();
      const channelId = selectedChannel?.id;

      if (!storeId || !channelId || !selectedEmail) {
        setSelectedTemplate(null);
        return;
      }

      try {
        setLoadingTemplate(true);
        setError(null);

        // Map frontend key to backend templateType
        const backendKey = EMAIL_KEY_MAP[selectedEmail] || selectedEmail;
        const template = await getEmailTemplateByType(channelId, backendKey);
        setSelectedTemplate(template);
        // Initialize email heading when template is loaded
        if (template?.heading) {
          setEmailHeading(template.heading);
        }
        // Initialize email body when template is loaded
        if (template?.body) {
          setEmailBody(template.body);
          setOriginalEmailBody(template.body);
          // Parse and initialize heading, description, and button blocks
          const parsed = parseEmailBody(template.body);
          setEmailHeadingText(parsed.heading);
          setEmailDescriptionText(parsed.description);
          setEmailButtonText(parsed.buttonText);
          setOriginalHeadingText(parsed.heading);
          setOriginalDescriptionText(parsed.description);
          setOriginalButtonText(parsed.buttonText);
        }
        // Initialize banner image URL
        if (template?.imageUrl) {
          setOriginalImageUrl(template.imageUrl);
          setBannerImagePreview(null);
        }
        // Reset edit mode and file uploads when template changes
        setIsEditMode(false);
        setBannerImageFile(null);
        setBannerImagePreview(null);
      } catch (err) {
        console.error("Error fetching email template:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load email template",
        );
        setSelectedTemplate(null);
      } finally {
        setLoadingTemplate(false);
      }
    };

    fetchEmailTemplate();
  }, [selectedEmail, selectedChannel?.id]);

  const handleToggle = async (key: string, enabled: boolean) => {
    // Check if this is a restricted email and user is trying to enable it
    if (isFreePlan() && isRestrictedEmail(key) && enabled) {
      const emailLabel =
        emailNotifications.find((e) => e.key === key)?.label || "Email";
      showUpgradeModalForFeature(emailLabel);
      return;
    }

    const storeId = getStoreId();
    const channelId = selectedChannel?.id;

    if (!storeId || !channelId) {
      setError("Store ID or Channel ID is missing");
      return;
    }

    // Optimistically update UI
    setEmailNotifications((prev) =>
      prev.map((email) => (email.key === key ? { ...email, enabled } : email)),
    );

    try {
      setSavingEmailKey(key);
      setError(null);

      // Fetch current settings first
      const currentSettings = await getCollectSettings(storeId, channelId);

      // Prepare updated email settings
      const backendKey = EMAIL_KEY_MAP[key];
      const updatedEmailSetting = {
        ...(currentSettings?.emailSetting || {}),
        [backendKey]: {
          enable: enabled,
          id: currentSettings?.emailSetting?.[backendKey]?.id || null,
        },
      };

      // Save to backend
      await saveCollectSettings(storeId, channelId, {
        emailSetting: updatedEmailSetting,
      });
    } catch (err) {
      console.error("Error saving email settings:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save email settings",
      );
      // Revert optimistic update on error
      setEmailNotifications((prev) =>
        prev.map((email) =>
          email.key === key ? { ...email, enabled: !enabled } : email,
        ),
      );
    } finally {
      setSavingEmailKey(null);
    }
  };

  const handleEditClick = () => {
    if (selectedTemplate?.heading) {
      setEmailHeading(selectedTemplate.heading);
    }
    if (selectedTemplate?.body) {
      setEmailBody(selectedTemplate.body);
      setOriginalEmailBody(selectedTemplate.body);
      // Parse and initialize heading, description, and button blocks
      const parsed = parseEmailBody(selectedTemplate.body);
      setEmailHeadingText(parsed.heading);
      setEmailDescriptionText(parsed.description);
      setEmailButtonText(parsed.buttonText);
      setOriginalHeadingText(parsed.heading);
      setOriginalDescriptionText(parsed.description);
      setOriginalButtonText(parsed.buttonText);
    }
    if (selectedTemplate?.imageUrl) {
      setOriginalImageUrl(selectedTemplate.imageUrl);
    }
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    // Reset to original template heading
    if (selectedTemplate?.heading) {
      setEmailHeading(selectedTemplate.heading);
    }
    // Reset email body to original
    if (originalEmailBody) {
      setEmailBody(originalEmailBody);
    }
    // Reset heading, description, and button blocks
    if (originalHeadingText) {
      setEmailHeadingText(originalHeadingText);
    }
    if (originalDescriptionText) {
      setEmailDescriptionText(originalDescriptionText);
    }
    if (originalButtonText) {
      setEmailButtonText(originalButtonText);
    }
    // Reset banner image changes
    setBannerImageFile(null);
    setBannerImagePreview(null);
    if (originalImageUrl) {
      setOriginalImageUrl(originalImageUrl);
    }
    setIsEditMode(false);
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Supported formats: GIF, JPEG, PNG");
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Maximum file size: 5MB");
      return;
    }

    setError(null);
    setBannerImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTemplate = async () => {
    const storeId = getStoreId();
    const channelId = selectedChannel?.id;

    if (!storeId || !channelId || !selectedTemplate) {
      setError("Store ID, Channel ID, or Template is missing");
      return;
    }

    // Validate email heading
    if (!emailHeading || emailHeading.trim() === "") {
      setError("Email heading is required");
      return;
    }

    if (emailHeading.length > 50) {
      setError("Email heading must be 50 characters or less");
      return;
    }

    try {
      setSavingTemplate(true);
      setError(null);

      // Map frontend key to backend templateType
      const backendKey = EMAIL_KEY_MAP[selectedEmail] || selectedEmail;

      // Determine imageUrl - use new uploaded image if available, otherwise keep original
      let imageUrl = selectedTemplate.imageUrl || "";
      if (bannerImageFile) {
        // Image will be uploaded and URL will be returned from server
        // For now, we'll pass the file and let the server handle the upload
      }

      // Reconstruct body with edited values while preserving structure
      // This updates ONLY text nodes, preserving all spans, classes, and inline styles
      const reconstructedBody = reconstructEmailBody(
        emailHeadingText || emailHeading,
        emailDescriptionText,
        emailButtonText,
        originalEmailBody || selectedTemplate.body || "",
      );

      // Update the template with new heading, reconstructed body, and banner image
      const updatedTemplate = await updateEmailTemplate(
        channelId,
        backendKey,
        {
          name: selectedTemplate.name,
          heading: emailHeading.trim(),
          imageUrl: imageUrl, // Will be updated by server if bannerImageFile is provided
          body: reconstructedBody, // Reconstructed with edited values, structure preserved
          emailTemplate: selectedTemplate.emailTemplate || "",
          options: selectedTemplate.options || [],
        },
        bannerImageFile || undefined,
      );

      // Update local state with the updated template from server
      setSelectedTemplate(updatedTemplate);
      // Update email heading state to match the saved value
      setEmailHeading(updatedTemplate.heading || emailHeading.trim());
      // Update email body state with the saved body
      if (updatedTemplate.body) {
        setEmailBody(updatedTemplate.body);
        setOriginalEmailBody(updatedTemplate.body);
        // Parse the saved body to update editable values in state
        const parsed = parseEmailBody(updatedTemplate.body);
        setEmailHeadingText(parsed.heading);
        setEmailDescriptionText(parsed.description);
        setEmailButtonText(parsed.buttonText);
        setOriginalHeadingText(parsed.heading);
        setOriginalDescriptionText(parsed.description);
        setOriginalButtonText(parsed.buttonText);
      }
      // Update image URL if it was changed
      if (updatedTemplate.imageUrl) {
        setOriginalImageUrl(updatedTemplate.imageUrl);
        // Clear file and preview since it's now saved
        setBannerImageFile(null);
        setBannerImagePreview(null);
      }
      setIsEditMode(false);

      // Show success message (you can use toast here if available)
      console.log("✅ Email template updated successfully");
    } catch (err) {
      console.error("Error saving email template:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save email template",
      );
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-nowrap gap-4 justify-between items-center w-full">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h1 className="text-xl font-bold">Manage Emails</h1>
              <p className="text-sm text-gray-600 truncate">
                Customize the way you want customers to collect points
              </p>
            </div>

            <div className="flex flex-shrink-0 gap-2.5 items-center">
              <ChannelSelector />
              {(storePlan?.plan === "free" || storePlan?.limitReached) && (
                <Button
                  onClick={() => router.push("/pricing")}
                  className="custom-btn"
                >
                  Upgrade
                </Button>
              )}
            </div>
          </div>

          {!selectedChannel && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded text-sm">
              Select a channel to view and manage email templates.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <div className="card min-w-[300px] max-w-[300px] bg-[#F7F7F7] !p-0">
              <div className="flex flex-col gap-0 h-[calc(100lvh-98px)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500">Loading...</div>
                  </div>
                ) : (
                  emailNotifications.map((email) => {
                    const isActive = selectedEmail === email.key;
                    const isPremium = isRestrictedEmail(email.key);
                    return (
                      <div
                        key={email.key}
                        className={`flex items-center justify-between py-4 px-3 cursor-pointer transition-colors gap-3 border-b border-[#dedede] ${
                          isActive
                            ? "bg-[#3f3f3f] text-white"
                            : "hover:bg-[#f7f7f7]"
                        } ${isPremium ? "opacity-60 blur-[0.5px]" : ""}`}
                        onClick={() => setSelectedEmail(email.key)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0 relative">
                          <div className="flex-shrink-0 relative">
                            <Image
                              src={email.icon}
                              alt={email.label}
                              width={30}
                              height={30}
                              style={{
                                minWidth: "30px",
                                minHeight: "30px",
                                filter: isActive
                                  ? "brightness(0) invert(1)"
                                  : "none",
                              }}
                            />
                            {isPremium && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center z-10 shadow-md border-2 border-white">
                                <svg
                                  className="w-2.5 h-2.5 text-yellow-800"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isActive ? "text-white" : "text-[#303030]"
                            }`}
                          >
                            {email.label}
                          </span>
                        </div>
                        <div
                          className="flex-shrink-0 ml-2 flex items-center justify-center min-w-[40px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPremium && !email.enabled) {
                              showUpgradeModalForFeature(email.label);
                            }
                          }}
                        >
                          {savingEmailKey === email.key ? (
                            <Spinner
                              size="sm"
                              color="success"
                              className="w-5 h-5"
                            />
                          ) : (
                            <Switch
                              size="sm"
                              color="success"
                              isSelected={email.enabled}
                              isDisabled={savingEmailKey !== null || isPremium}
                              classNames={{
                                base: isPremium
                                  ? "opacity-50 cursor-not-allowed"
                                  : "",
                              }}
                              onValueChange={(enabled) =>
                                handleToggle(email.key, enabled)
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card flex-1">
              <div className="flex flex-col gap-4">
                {/* Header */}
                {isEditMode ? (
                  <div className="flex flex-col gap-4">
                    {/* Title and Action Buttons */}
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-[#303030]">
                        {selectedTemplate?.heading ||
                          selectedTemplate?.name ||
                          emailNotifications.find(
                            (e) => e.key === selectedEmail,
                          )?.label ||
                          "Email Preview"}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveTemplate}
                          disabled={savingTemplate}
                          className="flex items-center gap-1 px-4 py-2 bg-[#3f3f3f] text-white rounded-md hover:bg-[#2f2f2f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {savingTemplate ? (
                            <Spinner size="sm" color="default" />
                          ) : (
                            <>
                              <Upload size={14} />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={savingTemplate}
                          className="flex items-center gap-1 px-4 py-2 bg-white text-[#3f3f3f] border border-[#3f3f3f] rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>
                    {/* Email Heading Input */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm text-[#303030]">
                        Email Heading
                      </label>
                      <input
                        type="text"
                        value={emailHeading}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 50) {
                            setEmailHeading(value);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email heading"
                        maxLength={50}
                      />
                      <div className="text-xs text-gray-500">
                        {emailHeading.length}/50 characters
                      </div>
                    </div>

                    {/* Banner Image Upload */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-[#303030]">
                        Banner Image
                      </label>

                      {/* File Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center bg-white hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          id="banner-image-upload"
                          accept="image/gif,image/jpeg,image/jpg,image/png"
                          onChange={handleBannerImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="banner-image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                            Add file
                          </div>
                        </label>
                      </div>

                      {/* Restrictions */}
                      <div className="text-xs text-gray-500">
                        <p>Supported formats: GIF, JPEG, PNG</p>
                        <p>Maximum file size: 5MB</p>
                      </div>

                      {/* Current/Preview Image */}
                      {(bannerImagePreview ||
                        originalImageUrl ||
                        selectedTemplate?.imageUrl) && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-2">
                            Current banner image
                          </p>
                          <div className="w-32 h-32 border border-gray-200 rounded-md overflow-hidden bg-white">
                            <img
                              src={
                                bannerImagePreview ||
                                originalImageUrl ||
                                selectedTemplate?.imageUrl ||
                                ""
                              }
                              alt="Banner preview"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback if image fails to load
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Body Rich Text Editor */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-[#303030]">
                        Email Body
                      </label>
                      {typeof window !== "undefined" && (
                        <EmailBodyEditor
                          headingValue={emailHeadingText}
                          descriptionValue={emailDescriptionText}
                          buttonValue={emailButtonText}
                          onHeadingChange={(value) => {
                            setEmailHeadingText(value);
                            // Reconstruct body for preview (updates only text nodes, preserves structure)
                            const newBody = reconstructEmailBody(
                              value,
                              emailDescriptionText,
                              emailButtonText,
                              originalEmailBody,
                            );
                            setEmailBody(newBody);
                          }}
                          onDescriptionChange={(value) => {
                            setEmailDescriptionText(value);
                            // Reconstruct body for preview (updates only text nodes, preserves structure)
                            const newBody = reconstructEmailBody(
                              emailHeadingText,
                              value,
                              emailButtonText,
                              originalEmailBody,
                            );
                            setEmailBody(newBody);
                          }}
                          onButtonChange={(value) => {
                            setEmailButtonText(value);
                            // Reconstruct body for preview (updates only text nodes, preserves structure)
                            const newBody = reconstructEmailBody(
                              emailHeadingText,
                              emailDescriptionText,
                              value,
                              originalEmailBody,
                            );
                            setEmailBody(newBody);
                          }}
                          templateOptions={selectedTemplate?.options || []}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-[#303030]">
                      {selectedTemplate?.heading ||
                        selectedTemplate?.name ||
                        emailNotifications.find((e) => e.key === selectedEmail)
                          ?.label ||
                        "Email Preview"}
                    </h2>
                    {isFreePlan() && isRestrictedEmail(selectedEmail) ? (
                      <button
                        onClick={() => {
                          const emailLabel =
                            emailNotifications.find(
                              (e) => e.key === selectedEmail,
                            )?.label || "Email Notification";
                          showUpgradeModalForFeature(emailLabel);
                        }}
                        className="custom-btn flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil size={14} />
                        Upgrade to Edit
                      </button>
                    ) : (
                      <button
                        onClick={handleEditClick}
                        className="custom-btn flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    )}
                  </div>
                )}

                {/* Email Preview */}
                <div
                  className={`bg-white ${isEditMode ? "h-auto pb-4" : "h-[calc(100lvh-174px)]"} ${isEditMode ? "" : "overflow-y-auto"}`}
                >
                  {loadingTemplate ? (
                    <div className="flex items-center justify-center py-20">
                      <Spinner size="lg" color="primary" />
                    </div>
                  ) : selectedTemplate ? (
                    (() => {
                      // Process template HTML to replace placeholders
                      let templateHtml = selectedTemplate.emailTemplate || "";

                      // Replace banner_image placeholder with actual image (hide in edit mode)
                      if (selectedTemplate.imageUrl && !isEditMode) {
                        // For festival and coupon expire templates, ensure white background and proper centering/margins
                        const isFestivalTemplate =
                          selectedTemplate.templateType === "festival" ||
                          selectedEmail === "festival" ||
                          selectedTemplate.name
                            ?.toLowerCase()
                            .includes("festival");

                        const isCouponExpireTemplate =
                          selectedTemplate.templateType === "couponExpire" ||
                          selectedEmail === "couponExpire" ||
                          selectedTemplate.name
                            ?.toLowerCase()
                            .includes("coupon") ||
                          selectedTemplate.heading
                            ?.toLowerCase()
                            .includes("coupon expiration");

                        const needsSpecialStyling =
                          isFestivalTemplate || isCouponExpireTemplate;

                        let imageUrl = selectedTemplate.imageUrl;

                        // If it's a Cloudinary URL and needs special styling, add white background transformation
                        if (
                          needsSpecialStyling &&
                          imageUrl.includes("res.cloudinary.com")
                        ) {
                          // Add Cloudinary transformation to set white background
                          // Insert transformation before the filename
                          if (imageUrl.includes("/upload/")) {
                            imageUrl = imageUrl.replace(
                              "/upload/",
                              "/upload/b_white/",
                            );
                          }
                        }

                        // Wrap image in a container with proper centering and margins
                        if (needsSpecialStyling) {
                          // Center the image with proper margins and white background
                          // The template already has a centered table cell, so we just need to add padding and ensure white background
                          const bannerImageHtml = `<div style="background-color: #ffffff; text-align: center; padding: 30px 20px; margin: 0 auto; max-width: 100%; box-sizing: border-box;"><img src="${process.env.NEXT_PUBLIC_BASE_PATH || ""}${imageUrl}" alt="${selectedTemplate.heading || selectedTemplate.name}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; background-color: #ffffff; vertical-align: middle;" /></div>`;
                          templateHtml = templateHtml.replace(
                            /\{\{\{banner_image\}\}\}/g,
                            bannerImageHtml,
                          );
                        } else {
                          const bannerImageHtml = `<img src="${process.env.NEXT_PUBLIC_BASE_PATH || ""}${imageUrl}" alt="${selectedTemplate.heading || selectedTemplate.name}" style="max-width: 100%; height: auto;" />`;
                          templateHtml = templateHtml.replace(
                            /\{\{\{banner_image\}\}\}/g,
                            bannerImageHtml,
                          );
                        }
                      } else if (isEditMode) {
                        // Hide banner image in edit mode - replace with empty div to maintain layout
                        templateHtml = templateHtml.replace(
                          /\{\{\{banner_image\}\}\}/g,
                          '<div style="display: none;"></div>',
                        );
                      }

                      // Replace heading placeholder if it exists
                      if (selectedTemplate.heading) {
                        templateHtml = templateHtml.replace(
                          /\{\{\{heading\}\}\}/g,
                          selectedTemplate.heading,
                        );
                      }

                      // Replace body_children placeholder with actual body content
                      // In edit mode: hide body content
                      // In preview mode: show reconstructed body with edited values
                      if (isEditMode) {
                        // Hide body content in edit mode - replace with empty div to maintain layout
                        templateHtml = templateHtml.replace(
                          /\{\{\{body_children\}\}\}/g,
                          '<div style="display: none;"></div>',
                        );
                      } else {
                        // Use reconstructed body (with edited values) or fallback to original
                        const bodyContent =
                          emailBody ||
                          originalEmailBody ||
                          selectedTemplate.body ||
                          "";
                        if (bodyContent) {
                          templateHtml = templateHtml.replace(
                            /\{\{\{body_children\}\}\}/g,
                            bodyContent,
                          );
                        }
                      }

                      return (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: templateHtml || selectedTemplate.body || "",
                          }}
                          style={{
                            fontFamily: "Arial, sans-serif",
                            maxWidth: "600px",
                            margin: "0 auto",
                            paddingBottom: isEditMode ? "20px" : "auto",
                          }}
                        />
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center text-gray-500">
                        <p>No email template found</p>
                        <p className="text-sm mt-2">
                          Select an email from the list to preview
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName={restrictedFeatureName || "Email Notification"}
      />
    </>
  );
}
