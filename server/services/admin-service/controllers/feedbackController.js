import nodemailer from "nodemailer";
import Feedback from "../models/feedbackModel.js";
import Admin from "../models/adminModel.js";
import fetch from 'node-fetch';

// Create new feedback/support message
export const createFeedback = async (req, res) => {
  try {
    const { name, email, mobile, userType, subject, message } = req.body;
    if (!name || !subject || !message || (!email && !mobile)) {
      return res.status(400).json({ message: "Name, subject, message, and either email or mobile are required." });
    }
    // Find the latest thread for this mobile and userType
    let feedback = await Feedback.findOne({ mobile, userType }).sort({ createdAt: -1 });
    if (feedback && feedback.status !== 'closed') {
      // Append to replies as userType (client/worker)
      feedback.replies.push({ message, sender: userType });
      await feedback.save();
      return res.status(200).json(feedback);
    } else {
      // Create new feedback with first message in replies
      feedback = await Feedback.create({
        name,
        email,
        mobile,
        userType,
        subject,
        message, // legacy, for admin view
        status: 'open',
        replies: [{ message, sender: userType }]
      });
      return res.status(201).json(feedback);
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Helper to get user/worker details by mobile and userType
const getUserOrWorkerDetailsByMobile = async (mobile, userType) => {
  if (!mobile || !userType) return null;
  try {
    if (userType === 'client') {
      const res = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/users/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (data.exists && data.user) {
        return {
          displayName: data.user.displayName || data.user.firstName || data.user.username,
          profileImage: data.user.profileImage || data.user.photo || '',
        };
      }
    } else if (userType === 'worker') {
      const res = await fetch(`${process.env.WORKER_SERVICE_URL}/api/v1/workers/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (data.exists && data.worker) {
        return {
          displayName: data.worker.displayName || data.worker.firstName || data.worker.username,
          profileImage: data.worker.profileImage || data.worker.photo || '',
        };
      }
    }
  } catch {
    return null;
  }
  return null;
};

// Helper to get user/worker details by mobile or email and userType
const getUserOrWorkerDetailsByMobileOrEmail = async (mobile, email, userType) => {
  if (mobile && userType) {
    return await getUserOrWorkerDetailsByMobile(mobile, userType);
  }
  // Try by email for client
  if (email && userType === 'client') {
    try {
      const res = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/users/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.exists && data.user) {
        return {
          displayName: data.user.displayName || data.user.firstName || data.user.username,
          profileImage: data.user.profileImage || data.user.photo || '',
        };
      }
    } catch { return null; }
  }
  // (Add similar for worker if needed)
  return null;
};

// Get all feedback (admin only)
export const getAllFeedback = async (req, res) => {
  try {
    const { mobile, userType } = req.query;
    let feedbacks;
    if (mobile && userType) {
      feedbacks = await Feedback.find({ mobile, userType }).sort({ createdAt: -1 });
    } else {
      feedbacks = await Feedback.find().sort({ createdAt: -1 });
    }
    // Enrich each feedback with displayName and profileImage
    const enriched = await Promise.all(feedbacks.map(async fb => {
      const details = await getUserOrWorkerDetailsByMobileOrEmail(fb.mobile, fb.email, fb.userType);
      return {
        ...fb.toObject(),
        displayName: details?.displayName || fb.name || '',
        profileImage: details?.profileImage || '',
      };
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single feedback by ID
const enrichFeedbackWithDetails = async (feedback) => {
  const details = await getUserOrWorkerDetailsByMobileOrEmail(feedback.mobile, feedback.email, feedback.userType);
  return {
    ...feedback.toObject(),
    displayName: details?.displayName || feedback.name || '',
    profileImage: details?.profileImage || '',
  };
};

export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });
    const enriched = await enrichFeedbackWithDetails(feedback);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update feedback status
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const replyFeedback = async (req, res) => {
  try {
    const { feedbackId, replyMessage } = req.body;
    if (!feedbackId || !replyMessage) {
      return res
        .status(400)
        .json({ message: "Feedback ID and reply message are required." });
    }
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });
    // Save reply to feedback
    feedback.replies = feedback.replies || [];
    feedback.replies.push({
      message: replyMessage,
      sentAt: new Date(),
      sender: "admin",
    });
    await feedback.save();
    // If email exists, send reply via nodemailer
    if (feedback.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; padding: 0; min-height: 100vh;">
          <div style="display: flex; align-items: center; gap: 14px; padding: 40px 32px 0 32px;">
            <img src='https://res.cloudinary.com/labourhunt-cloud/image/upload/v1751537810/LabourHunt_Logo_Composite_ywlmke.png' alt='LabourHunt Logo' style="height:2.5rem; width:auto" />
          </div>
          <div style="padding: 18px 32px 32px 32px; text-align: left;">
            <p style="font-size: 1.1rem; color: #222; margin-bottom: 20px;">Hi <b>${feedback.name}</b>,</p>
            <p style="font-size: 1rem; color: #333; margin-bottom: 28px;">${replyMessage}</p>
            <p style="font-size: 0.95rem; color: #666; margin-top: 28px;">If you have further questions, just reply to this email or contact us at <a href=\"mailto:labourhunt.noreply@gmail.com\" style=\"color: #0A66C2; text-decoration: underline;\">support@labourhunt.com</a>.</p>
          </div>
          <div style=" color: #888; text-align: center; font-size: 0.95rem; padding: 16px 0; border-top: 1px solid #e5e7eb;">
            &copy; ${new Date().getFullYear()} LabourHunt. All rights reserved.
          </div>
        </div>
      `;
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: feedback.email,
        subject: `Re: ${feedback.subject}`,
        text: replyMessage,
        html,
      });
    }
    // If mobile exists, just save the reply (chatbox will fetch and show it)
    // No SMS or push needed for now
    res.json({ message: "Reply sent successfully", feedback });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send reply", error: err.message });
  }
};

export const checkEmailRegistered = async (req, res) => {
  const { email } = req.query;
  if (!email)
    return res
      .status(400)
      .json({ registered: false, message: "Email is required" });
  try {
    const admin = await Admin.findOne({ email });
    const registered = !!admin;
    return res.json({ registered });
  } catch (err) {
    return res
      .status(500)
      .json({
        registered: false,
        message: "Error checking registration",
        error: err.message,
      });
  }
};

// Get latest feedback thread for a user (client/worker)
export const getUserThread = async (req, res) => {
  try {
    const { mobile, userType } = req.query;
    // Only allow if JWT matches the requested mobile/userType
    if (req.mobile !== mobile || req.role !== userType) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const thread = await Feedback.findOne({ mobile, userType }).sort({ createdAt: -1 });
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    const enriched = await enrichFeedbackWithDetails(thread);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
