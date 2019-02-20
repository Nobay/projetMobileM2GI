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

    public getMembership(userId: string, groupId: string): Observable<Membership> {
        return this.membershipCollection.doc<Membership>(userId + '_' + groupId).valueChanges();
    }

    public addMembership(membership: Membership) {
        this.membershipCollection.doc<Membership>(membership.userId + '_' + membership.groupId).set(membership);
    }

    public editMembership(membership: Membership) {
        this.membershipCollection.doc<Membership>(membership.userId + '_' + membership.groupId)
            .update(membership);
    }

    public async deleteMemberships(groupId: string) {
        const qry = await this.db.collection<Membership>('memberships', ref => {
            return ref.where('groupId', '==', groupId);
        }).ref.get();
        const batch = this.db.firestore.batch();
        qry.forEach(doc => {
            console.log('deleting....', doc.id);
            batch.delete(doc.ref);
        });

        batch.commit().then(res => console.log('committed batch.'))
            .catch(err => console.error('error committing batch.', err));
    }

    public deleteMembership(userId: string, groupId: string) {
        this.membershipCollection.doc<Membership>(userId + '_' + groupId).delete();
    }

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

    public getGroup(groupId: string): Observable<Group> {
        return this.groupCollection.doc<Group>(groupId).valueChanges();
    }

    public addGroup(group: Group) {
        this.groupCollection.doc<Group>(group.uuid).set(group);
    }

    public editGroup(group: Group) {
        this.groupCollection.doc<Group>(group.uuid)
            .update(group);
    }

    public deleteGroup(groupId: string) {
        this.groupCollection.doc<Group>(groupId).delete();
    }

    public makeId(): string {
        return Math.random().toString(36).substr(2, 12);
    }
}
