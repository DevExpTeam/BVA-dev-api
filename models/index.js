const { db } = require("../firebase");

class Admin {
  static async getSettings() {
    const doc = await db.collection("admin").doc("userSettings").get();
    return doc.data();
  }

  static async updateSettings(data) {
    await db.collection("admin").doc("userSettings").update(data);
  }
}

class User {
  static async findByUserId(userId) {
    const userDoc = await db.collection("users").doc(userId).get();
    return userDoc.data();
  }

  static async findByUserEmail(email) {
    const userRef = db.collection("users");
    const snapshot = await userRef.where("email", "==", email).get();
    return snapshot?.docs?.map((doc) => doc.data());
  }

  static async activeUserById(userId) {
    await db.collection("users").doc(userId).update({
      isActive: true,
    });
  }
  static async inActiveUserById(userId) {
    await db.collection("users").doc(userId).update({
      isActive: false,
    });
  }

  static async isUserActive(userId) {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return false;
    }
    const userData = userDoc.data();
    return userData.isActive === true;
  }
}

class Source {
  static async findById(sourceId) {
    const sourceRef = db.collection("sources").doc(sourceId);
    const doc = await sourceRef.get();
    return doc.exists ? doc.data() : null;
  }

  static async create(data) {
    const sourceRef = db.collection("sources").doc();
    const timestamp = new Date().getTime();
    await sourceRef.set({
      ...data,
      id: sourceRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: sourceRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  static async getAll() {
    const sourcesRef = db.collection("sources");
    const snapshot = await sourcesRef.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  static async updateBySourceRefId(sourceId, updateData) {
    const sessionsRef = db.collection("sources");
    const querySnapshot = await sessionsRef
      .where("id", "==", sourceId)
      .limit(1)
      .get();
    const doc = querySnapshot.docs[0];

    // Update the document
    const updateddata = await doc.ref.update({
      ...updateData,
      updatedAt: Date.now(), // Update the updatedAt timestamp
    });
    return updateddata;
  }
}

class AllCompany {
  static async create(data) {
    const companyRef = db.collection("allCompany").doc();
    const timestamp = new Date().getTime();
    await companyRef.set({
      ...data,
      id: companyRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: companyRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  static async getAll() {
    const companyRef = db.collection("allCompany");
    const snapshot = await companyRef.get();
    return snapshot.docs.map((doc) => doc.data());
  }
  
  static async getByUserId(userId) {
    const companyRef = db.collection("allCompany");
    const snapshot = await companyRef.where("userId", "==", userId).get();
    return snapshot?.docs?.map((doc) => doc.data());
  }

  static async findById(companyId) {
    const companyRef = db.collection("allCompany").doc(companyId);
    const doc = await companyRef.get();
    return doc.exists ? doc.data() : null;
  }

  static async findByUserIdCompanyName(userId, companyName) {
    const companyRef = db.collection("allCompany");
    const snapshot = await companyRef
      .where("userId", "==", userId)
      .where("companyName", "==", companyName)
      .get();
    
    return snapshot.docs[0]?.data();
  }

  static async updateByCompanyRefId(companyId, updateData) {
    const companyRef = db.collection("allCompany");
    const snapshot = await companyRef
      .where("id", "==", companyId)
      .limit(1)
      .get();
    const doc = snapshot.docs[0];
    // Update the document
    const updateddata = await doc.ref.update({
      ...updateData,
      updatedAt: Date.now(), // Update the updatedAt timestamp
    });
    return updateddata;
  }
}

class AccountingData {
  static async create(data) {
    const companyRef = db.collection("accountingData").doc();
    await companyRef.set(data);
  }

  static async findById(companyId) {
    const sessionsRef = db.collection("accountingData");
    const snapshot = await sessionsRef.where("companyId", "==", companyId).get();
    return snapshot.docs[0].data();
  }

  static async updateByCompanyRefId(companyId, accountingData) {
    const sessionsRef = db.collection("accountingData");
    const querySnapshot = await sessionsRef
      .where("companyId", "==", companyId)
      .limit(1)
      .get();
    const doc = querySnapshot.docs[0];

    // Update the document
    const updateddata = await doc.ref.update({ ...accountingData });
    return updateddata;
  }
}

class Payment {
  static async create(data) {
    const paymentRef = db.collection("payments").doc();
    const timestamp = new Date().getTime();

    await paymentRef.set({
      ...data,
      id: paymentRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: paymentRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  static async findByUserId(userId) {
    const paymentsRef = db.collection("payments").where("userId", "==", userId);
    const snapshot = await paymentsRef.get();
    return snapshot.docs.map((doc) => doc.data());
  }
}

class Session {
  static async create(data) {
    const sessionRef = db.collection("sessions").doc();
    const timestamp = new Date().getTime();
    await sessionRef.set({
      ...data,
      id: sessionRef.id,
      completed: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: sessionRef.id,
      completed: false,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  static async findBySessionRefId(sessionId) {
    const sessionRef = db
      .collection("sessions")
      .where("sessionId", "==", sessionId);
    const snapshot = await sessionRef.get();
    console.log("snapshot", snapshot);
    console.log(
      "1212",
      snapshot.docs.map((doc) => doc.data())
    );
    const oldSession = snapshot.docs.map((doc) => doc.data());
    return oldSession[0];
  }

  static async updateBySessionRefId(sessionId, updateData) {
    const sessionsRef = db.collection("sessions");
    const querySnapshot = await sessionsRef
      .where("sessionId", "==", sessionId)
      .limit(1)
      .get();
    // console.log("No matching document found with sessionId:", querySnapshot);
    const doc = querySnapshot.docs[0];

    // Update the document
    const updateddata = await doc.ref.update({
      completed: true,
      updatedAt: Date.now(), // Update the updatedAt timestamp
    });
    return updateddata;
  }
}

class Subscription {
  static async create(data) {
    const subscriptionRef = db.collection("subscriptions").doc();
    const timestamp = new Date().getTime();
    await subscriptionRef.set({
      ...data,
      id: subscriptionRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: subscriptionRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  static async findByUserId(userId) {
    const subscriptionsRef = db
      .collection("subscriptions")
      .where("userId", "==", userId);
    const snapshot = await subscriptionsRef.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  static async updateBySubscriptionId(subscriptionId, updateData) {
    const subscriptionsRef = db.collection("subscriptions");
    const querySnapshot = await subscriptionsRef
      .where("subscriptionId", "==", subscriptionId)
      .limit(1)
      .get();

    const doc = querySnapshot.docs[0];
    if (!doc) return;
    const timestamp = new Date().getTime();
    const updatedData = await doc.ref.update({
      ...updateData,
      updatedAt: timestamp, // Update the updatedAt timestamp
    });

    return updatedData;
  }
}

class Company {
  static async create(data) {
    const companyRef = db.collection("company").doc();
    const timestamp = new Date().getTime();
    await companyRef.set({
      ...data,
      id: companyRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: companyRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
  static async findById(companyId) {
    const sourceRef = db.collection("company").doc(companyId);
    const doc = await sourceRef.get();
    return doc.exists ? doc.data() : null;
  }

  static async getAll() {
    const companyRef = db.collection("company");
    const snapshot = await companyRef.get();
    return snapshot.docs.map((doc) => doc.data());
  }
  static async getByUserId(userId) {
    const companyRef = db.collection("company");
    const snapshot = await companyRef.where("userId", "==", userId).get();
    return snapshot?.docs?.map((doc) => doc.data());
  }

  static async findById(companyId) {
    const companyRef = db.collection("company").doc(companyId);
    const doc = await companyRef.get();
    return doc.exists ? doc.data() : null;
  }

  static async updateByCompanyRefId(companyId, updateData) {
    const sessionsRef = db.collection("company");
    const querySnapshot = await sessionsRef
      .where("id", "==", companyId)
      .limit(1)
      .get();
    const doc = querySnapshot.docs[0];

    // Update the document
    const updateddata = await doc.ref.update({
      ...updateData,
      updatedAt: Date.now(), // Update the updatedAt timestamp
    });
    return updateddata;
  }
}

class DataSync {
  static async create(data) {
    const dataSyncRef = db.collection("dataSyncs").doc();
    const timestamp = new Date().getTime();
    await dataSyncRef.set({
      ...data,
      id: dataSyncRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return {
      id: dataSyncRef.id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  static async getByCompanyId(companyId) {
    const dataSyncRef = db.collection("dataSyncs");
    const snapshot = await dataSyncRef
      .where("companyId", "==", companyId)
      .get();
    return snapshot?.docs?.map((doc) => doc.data());
  }

  static async findById(dataSyncId) {
    const dataSyncRef = db.collection("dataSyncs").doc(dataSyncId);
    const doc = await dataSyncRef.get();
    return doc.exists ? doc.data() : null;
  }

  static async update(dataSyncId, data) {
    const timestamp = new Date().getTime();
    const dataSyncRef = db.collection("dataSyncs").doc(dataSyncId);
    await dataSyncRef.update({ ...data, updatedAt: timestamp });
  }
}

module.exports = {
  Admin,
  User,
  Source,
  Payment,
  Session,
  Subscription,
  AllCompany,
  AccountingData,
  Company,
  DataSync,
};
