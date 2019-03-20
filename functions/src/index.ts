import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
admin.initializeApp();


exports.membershipCreate = functions.firestore
    .document('memberships/{membershipId}')
    .onCreate(async (membership: any) => {

        const data = membership.data();
        const groupId = data.groupId;

        const db = admin.firestore();

        const groupsInMembership = db.collection('groups').where('uuid', '==', groupId);
        const groups = await groupsInMembership.get();

        let groupName;
        groups.forEach((result: any) => {
            groupName = result.data().name;
        });
        const membershipsOfGroup = db.collection('memberships').where('groupId', '==', groupId);
        const memberships = await membershipsOfGroup.get();

        let ownerId;
        memberships.forEach((result: any) => {
            console.log(result.data().userId);
            if (result.data().isOwner) {
                ownerId = result.data().userId;
            }
        });

        let content: any;
        if (!data.isOwner) {
            content = `Users want to join your group ${groupName} !`;
        }

        // Notification content
        const payload = {
            notification: {
                title: 'Group update',
                body: content,
                icon: 'https://res.cloudinary.com/dl71aaw7s/image/upload/v1552915995/icon.png'
            }
        };

        // ref to the device collection for the user
        const devicesRef = db.collection('devices').where('uuid', '==', ownerId);


        // get the user's tokens and send notifications
        const devices = await devicesRef.get();

        const tokens: any[] = [];

        // send a notification to each device token
        devices.forEach((result: any) => {
            const token = result.data().token;

            tokens.push(token);
        });

        return admin.messaging().sendToDevice(tokens, payload);

    });

exports.membershipUpdate = functions.firestore
    .document('memberships/{membershipId}')
    .onUpdate(async (membership: any) => {

        const data = membership.after.data();
        const uuid = data.userId;
        const groupId = data.groupId;

        const db = admin.firestore();

        const groupsInMembership = db.collection('groups').where('uuid', '==', groupId);
        const groups = await groupsInMembership.get();
        let groupName;
        groups.forEach((result: any) => {
            groupName = result.data().name;
        });

        let content: any;
        if (data.hasMembership) {
            content = `You have been accepted by the group ${groupName} !`;
        } else {
            content = `The group leader of ${groupName} just refused your request.`;
        }

        // Notification content
        const payload = {
            notification: {
                title: 'Group update',
                body: content,
                icon: 'https://res.cloudinary.com/dl71aaw7s/image/upload/v1552915995/icon.png'
            }
        };

        // ref to the device collection for the user
        const devicesRef = db.collection('devices').where('uuid', '==', uuid);


        // get the user's tokens and send notifications
        const devices = await devicesRef.get();

        const tokens: any[] = [];

        // send a notification to each device token
        devices.forEach((result: any) => {
            const token = result.data().token;

            tokens.push(token);
        });

        return admin.messaging().sendToDevice(tokens, payload);

    });
