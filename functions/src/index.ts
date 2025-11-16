import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getAllUsers = functions.https.onCall(async (data: any, context: any) => {
  // التحقق من وجود صلاحيات
  if (!context || !context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
  }

  const email = context.auth.token.email || "";
  const allowedAdmins = [
    "sara.falmohammadi@gmail.com",
    "sara.fawaz1998@gmail.com",
    "alrefaeinedaa@gmail.com",
    "amanii.almalki@gmail.com",
    
  ]; // عدلي الإيميلات حسب حسابات الأدمن المسموح لها

  if (!allowedAdmins.includes(email)) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized access");
  }

  const users: any[] = [];
  let nextPageToken: string | undefined;

  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    result.users.forEach((u) => {
      users.push({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        disabled: u.disabled,
        creationTime: u.metadata.creationTime,
      });
    });
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return users;
});
