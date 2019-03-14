import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {Membership} from '../models/membership';
import {Group} from '../models/group';
import {map} from 'rxjs/operators';


@Injectable()
export class MembershipServiceProvider {
    private membershipCollection: AngularFirestoreCollection<Membership>;
    private groupCollection: AngularFirestoreCollection<Group>;

    constructor(private db: AngularFirestore) {
        console.log('Hello MembershipServiceProvider Provider');
        this.membershipCollection = db.collection<Membership>('memberships');
        this.groupCollection = db.collection<Group>('groups');
    }

    /**
     * using a user's ID, a group ID and Cloud Firestore, we return an observable of the memberships
     * @param userId
     * @param groupId
     * @return Observable<Membership>
     */
    public getMembership(userId: string, groupId: string): Observable<Membership> {
        return this.membershipCollection.doc<Membership>(userId + '_' + groupId).valueChanges();
    }

    /**
     * using Cloud Firestore, we insert a membership into the collection of memberships.
     * @param membership
     */
    public addMembership(membership: Membership) {
        this.membershipCollection.doc<Membership>(membership.userId + '_' + membership.groupId).set(membership);
    }

    /**
     * using Cloud Firestore, we modify an existing membership in the collection of memberships.
     * @param membership
     */
    public editMembership(membership: Membership) {
        this.membershipCollection.doc<Membership>(membership.userId + '_' + membership.groupId)
            .update(membership);
    }

    /**
     * using Cloud Firestore and a group's ID, we delete all the memberships of the group.
     * @param groupId
     */
    public async deleteMemberships(groupId: string) {
        const qry = await this.db.collection<Membership>('memberships').ref.get();
        const batch = this.db.firestore.batch();
        qry.forEach(doc => {
            const idSplit = doc.id.split('_', 2);
            if (idSplit[1] === groupId) {
                batch.delete(doc.ref);
                console.log('deleting ' + doc.id);
            }
        });

        batch.commit().then(res => console.log('committed batch.'))
            .catch(err => console.error('error committing batch.', err));
    }

    /**
     * using a user's ID, a group ID and Cloud Firestore, we remove an existing membership from the collection of memberships.
     * @param userId
     * @param groupId
     */
    public deleteMembership(userId: string, groupId: string) {
        this.membershipCollection.doc<Membership>(userId + '_' + groupId).delete();
    }

    /**
     * using Cloud Firestore, we return an observable of the groups.
     * @return Observable<Group[]>
     */
    public getAllGroups(): Observable<Group[]> {
        return this.groupCollection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using Cloud Firestore and both the functions combined (getFirstHalf and getSecondHalf)
     * we return an observable of the memberships in which a user is not part of.
     * @param userId
     * @return Observable<Membership[]>
     */
    public getFirstHalf(userId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref
                .where('userId', '>', userId);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }
    public getSecondHalf(userId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref
                .where('userId', '<', userId);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using a user's ID and Cloud Firestore, we return an observable of the user's current memberships.
     * @param userId
     * @return Observable<Membership[]>
     */
    public getAllMyGroups(userId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref.where('userId', '==', userId);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using a user's ID and Cloud Firestore, we return an observable of the user's joined memberships.
     * @param userId
     * @return Observable<Membership[]>
     */
    public getJoinedGroups(userId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref.where('userId', '==', userId)
                .where('hasMembership', '==', true)
                .where('isOwner', '==', false);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using a user's ID and Cloud Firestore, we return an observable of the user's own memberships.
     * @param userId
     * @return Observable<Membership[]>
     */
    public getMyGroups(userId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref
                .where('userId', '==', userId)
                .where('isOwner', '==', true);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using a user's ID and Cloud Firestore, we return an observable of the user's pending memberships.
     * @param userId
     * @return Observable<Membership[]>
     */
    public getPendingGroups(userId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref
                .where('userId', '==', userId)
                .where('hasMembership', '==', false);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using a group's ID and Cloud Firestore, we return an observable of all the group's memberships.
     * @param groupId
     * @return Observable<Membership[]>
     */
    public getAllUsersInGroup(groupId: string): Observable<Membership[]> {
        return this.db.collection<Membership>('memberships', ref => {
            return ref.where('groupId', '==', groupId);
        }).snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data = a.payload.doc.data();
                    const id = a.payload.doc.id;
                    return { id, ...data};
                });
            })
        );
    }

    /**
     * using a group's ID and Cloud Firestore, we return an observable of the group.
     * @param groupId
     * @return Observable<Group>
     */
    public getGroup(groupId: string): Observable<Group> {
        return this.groupCollection.doc<Group>(groupId).valueChanges();
    }

    /**
     * using Cloud Firestore, we insert a group into the collection of groups.
     * @param group
     */
    public addGroup(group: Group) {
        this.groupCollection.doc<Group>(group.uuid).set(group);
    }

    /**
     * using Cloud Firestore, we modify an existing group in the collection of groups.
     * @param group
     */
    public editGroup(group: Group) {
        this.groupCollection.doc<Group>(group.uuid)
            .update(group);
    }

    /**
     * using the group's ID and Cloud Firestore, we remove the group from the collection of groups.
     * @param groupId
     */
    public deleteGroup(groupId: string) {
        this.groupCollection.doc<Group>(groupId).delete();
    }

    public makeId(): string {
        return Math.random().toString(36).substr(2, 12);
    }
}
