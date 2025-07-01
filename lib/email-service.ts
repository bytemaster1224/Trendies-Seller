"use client"

export interface EmailTemplate {
  to: string
  subject: string
  content: string
  type: "badge_upgrade" | "referral_invite" | "referral_converted" | "payout_notification"
}

export class BrevoEmailService {
  private static instance: BrevoEmailService
  private emailQueue: EmailTemplate[] = []

  static getInstance(): BrevoEmailService {
    if (!BrevoEmailService.instance) {
      BrevoEmailService.instance = new BrevoEmailService()
    }
    return BrevoEmailService.instance
  }

  async sendEmail(template: EmailTemplate): Promise<{ success: boolean; messageId: string }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Add to queue for demonstration
    this.emailQueue.push(template)

    // Log email for debugging
    console.log("📧 Brevo Email Sent:", {
      to: template.to,
      subject: template.subject,
      type: template.type,
      timestamp: new Date().toISOString(),
    })

    // Show notification to user
    if (typeof window !== "undefined") {
      this.showEmailNotification(template)
    }

    return {
      success: true,
      messageId: `brevo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    }
  }

  private showEmailNotification(template: EmailTemplate) {
    // Create a temporary notification
    const notification = document.createElement("div")
    notification.className = "fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="text-sm font-medium">📧 Email Sent!</div>
      </div>
      <div class="text-xs mt-1 opacity-90">${template.subject}</div>
      <div class="text-xs opacity-75">To: ${template.to}</div>
    `

    document.body.appendChild(notification)

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  getEmailQueue(): EmailTemplate[] {
    return [...this.emailQueue]
  }

  clearEmailQueue(): void {
    this.emailQueue = []
  }

  // Email templates
  static createBadgeUpgradeEmail(userEmail: string, newBadge: string): EmailTemplate {
    return {
      to: userEmail,
      subject: `🎉 Congratulations! You've been upgraded to ${newBadge}`,
      content: `
        <h2>Badge Upgrade Notification</h2>
        <p>Congratulations! Your seller status has been upgraded to <strong>${newBadge}</strong>.</p>
        <p>You now have access to enhanced features and benefits.</p>
        <p>Keep up the excellent work!</p>
      `,
      type: "badge_upgrade",
    }
  }

  static createReferralInviteEmail(inviterName: string, inviteeEmail: string, referralLink: string): EmailTemplate {
    return {
      to: inviteeEmail,
      subject: `${inviterName} invited you to join Trendies as a seller`,
      content: `
        <h2>You're Invited to Join Trendies!</h2>
        <p>${inviterName} thinks you'd be a great seller on our platform.</p>
        <p>Join now and start earning: <a href="${referralLink}">${referralLink}</a></p>
        <p>Get started today and unlock exclusive seller benefits!</p>
      `,
      type: "referral_invite",
    }
  }

  static createReferralConvertedEmail(inviterEmail: string, inviteeName: string): EmailTemplate {
    return {
      to: inviterEmail,
      subject: `🎉 Your referral ${inviteeName} just joined Trendies!`,
      content: `
        <h2>Referral Success!</h2>
        <p>${inviteeName} has successfully joined Trendies using your referral link.</p>
        <p>You've earned MAD 500 in referral rewards!</p>
        <p>Keep sharing and earning more rewards.</p>
      `,
      type: "referral_converted",
    }
  }
}
