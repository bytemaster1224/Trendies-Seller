"use client";

export interface EmailTemplate {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  type:
    | "referral_invite"
    | "referral_verification"
    | "referral_converted"
    | "referral_reward"
    | "loyalty_redemption";
  metadata?: Record<string, any>;
}

export class EnhancedBrevoEmailService {
  private static instance: EnhancedBrevoEmailService;
  private emailQueue: EmailTemplate[] = [];

  static getInstance(): EnhancedBrevoEmailService {
    if (!EnhancedBrevoEmailService.instance) {
      EnhancedBrevoEmailService.instance = new EnhancedBrevoEmailService();
    }
    return EnhancedBrevoEmailService.instance;
  }

  async sendEmail(
    template: EmailTemplate
  ): Promise<{ success: boolean; messageId: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add to queue for demonstration
    this.emailQueue.push(template);

    // Show notification to user
    if (typeof window !== "undefined") {
      this.showEmailNotification(template);
    }

    return {
      success: true,
      messageId: `brevo_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`,
    };
  }

  private showEmailNotification(template: EmailTemplate) {
    // Create a more sophisticated notification
    const notification = document.createElement("div");
    notification.className = `
      fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-sm p-4
      transform transition-all duration-300 ease-in-out
    `;
    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 text-sm">📧</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">Email Sent Successfully</p>
          <p class="text-xs text-gray-500 mt-1 truncate">${template.subject}</p>
          <p class="text-xs text-gray-400">To: ${template.to}</p>
        </div>
        <button class="flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          <span class="text-lg">&times;</span>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.transform = "translateX(100%)";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  // Enhanced email templates with beautiful HTML
  static createReferralInviteEmail(
    inviterName: string,
    inviteeEmail: string,
    referralCode: string,
    verificationToken: string
  ): EmailTemplate {
    const verificationLink = `${
      window.location.origin
    }/invite/${referralCode}?email=${encodeURIComponent(
      inviteeEmail
    )}&token=${verificationToken}`;

    const htmlContent = `
      <html>
        <body>
          <h2>${inviterName} invited you to join Trendies!</h2>
          <p>Your referral code: <b>${referralCode}</b></p>
          <a href="${verificationLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;">
            Join Trendies Now
          </a>
          <p>This invitation is for ${inviteeEmail}.</p>
        </body>
      </html>
    `;

    const textContent = `
      You're Invited to Join Trendies!
      
      ${inviterName} has invited you to join Trendies as a seller.
      
      Your referral code: ${referralCode}
      
      Join now: ${verificationLink}
    `;

    return {
      to: inviteeEmail,
      subject: `${inviterName} invited you to join Trendies - Your code: ${referralCode}`,
      htmlContent,
      textContent,
      type: "referral_invite",
      metadata: { inviterName, referralCode, verificationToken },
    };
  }

  static createReferralConvertedEmail(
    inviterEmail: string,
    inviterName: string,
    inviteeName: string
  ): EmailTemplate {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Referral Success - You Earned MAD 500!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
          .celebration { font-size: 48px; margin-bottom: 20px; }
          .header-text { color: white; font-size: 24px; font-weight: bold; }
          .content { padding: 40px 20px; text-align: center; }
          .reward-box { background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); padding: 30px; border-radius: 12px; margin: 20px 0; }
          .reward-amount { font-size: 36px; font-weight: bold; color: #92400e; }
          .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="celebration">🎉</div>
            <div class="header-text">Referral Success!</div>
          </div>
          
          <div class="content">
            <h2>Congratulations, ${inviterName}!</h2>
            <p><strong>${inviteeName}</strong> has successfully joined Trendies using your referral code.</p>
            
            <div class="reward-box">
              <div class="reward-amount">MAD 500</div>
              <p style="margin: 10px 0 0 0; color: #92400e; font-weight: bold;">Referral Reward Earned!</p>
            </div>
            
            <p>Your reward has been added to your account and will be included in your next payout.</p>
            <p>Keep sharing your referral code to earn more rewards!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Trendies. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: inviterEmail,
      subject: `🎉 Success! ${inviteeName} joined Trendies - You earned MAD 500!`,
      htmlContent,
      textContent: `Congratulations! ${inviteeName} joined Trendies using your referral code. You've earned MAD 500!`,
      type: "referral_converted",
      metadata: { inviterName, inviteeName },
    };
  }

  static createReferralConfirmationEmail(
    inviteeEmail: string,
    referralCode: string,
    inviterName: string
  ): EmailTemplate {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Trendies - Referral Confirmed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .header-text { color: white; font-size: 18px; opacity: 0.9; }
          .content { padding: 40px 20px; }
          .success-box { background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">trendies</div>
            <div class="header-text">Welcome to Our Community!</div>
          </div>
          
          <div class="content">
            <h2>Welcome to Trendies! 🎉</h2>
            <p>Thank you for joining Trendies using <strong>${inviterName}'s</strong> referral code.</p>
            
            <div class="success-box">
              <h3 style="color: #059669; margin: 0 0 10px 0;">✓ Referral Confirmed</h3>
              <p style="margin: 0; color: #065f46;">Code: <strong>${referralCode}</strong></p>
            </div>
            
            <p>You're now part of our exclusive seller community! Here's what happens next:</p>
            
            <ul style="text-align: left; color: #374151;">
              <li>Your account is being set up with premium seller features</li>
              <li>You'll receive access to our seller dashboard within 24 hours</li>
              <li>Our team will contact you with onboarding information</li>
              <li>Start listing your luxury items and earning commissions</li>
            </ul>
            
            <p>Welcome aboard, and thank you for choosing Trendies!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Trendies. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: inviteeEmail,
      subject: `Welcome to Trendies! Your referral with code ${referralCode} is confirmed`,
      htmlContent,
      textContent: `Welcome to Trendies! Your referral using code ${referralCode} from ${inviterName} has been confirmed. You'll receive access to your seller dashboard within 24 hours.`,
      type: "referral_verification",
      metadata: { referralCode, inviterName },
    };
  }

  static createLoyaltyRedemptionEmail(
    userEmail: string,
    userName: string,
    rewardName: string,
    pointsCost: number,
    remainingPoints: number
  ): EmailTemplate {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reward Redeemed Successfully</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .header-text { color: white; font-size: 18px; opacity: 0.9; }
          .content { padding: 40px 20px; }
          .reward-box { background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; }
          .reward-name { font-size: 24px; font-weight: bold; color: #92400e; margin-bottom: 10px; }
          .points-info { background-color: #f0f9ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background-color: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">trendies</div>
            <div class="header-text">🎁 Reward Redeemed!</div>
          </div>
          
          <div class="content">
            <h2>Congratulations, ${userName}!</h2>
            <p>Your reward has been successfully redeemed and is being processed.</p>
            
            <div class="reward-box">
              <div class="reward-name">${rewardName}</div>
              <p style="margin: 0; color: #92400e;">Cost: ${pointsCost.toLocaleString()} points</p>
            </div>
            
            <div class="points-info">
              <h3 style="color: #1d4ed8; margin: 0 0 10px 0;">Points Summary</h3>
              <p style="margin: 5px 0; color: #1e40af;"><strong>Points Used:</strong> ${pointsCost.toLocaleString()}</p>
              <p style="margin: 5px 0; color: #1e40af;"><strong>Remaining Balance:</strong> ${remainingPoints.toLocaleString()} points</p>
            </div>
            
            <p>Your reward will be processed within 24-48 hours. You'll receive another email once it's ready for collection or delivery.</p>
            <p>Thank you for being a valued member of Trendies!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">What's Next?</h4>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                <li>Our team will review and approve your redemption</li>
                <li>You'll receive a confirmation email within 24 hours</li>
                <li>Keep earning points for more exclusive rewards</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Trendies. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Congratulations, ${userName}!
      
      You've successfully redeemed: ${rewardName}
      Points Used: ${pointsCost.toLocaleString()}
      Remaining Balance: ${remainingPoints.toLocaleString()} points
      
      Your reward will be processed within 24-48 hours.
      
      Thank you for being a valued member of Trendies!
    `;

    return {
      to: userEmail,
      subject: `🎁 Reward Redeemed: ${rewardName} - ${remainingPoints.toLocaleString()} points remaining`,
      htmlContent,
      textContent,
      type: "loyalty_redemption",
      metadata: { rewardName, pointsCost, remainingPoints },
    };
  }

  getEmailQueue(): EmailTemplate[] {
    return [...this.emailQueue];
  }

  clearEmailQueue(): void {
    this.emailQueue = [];
  }
}
