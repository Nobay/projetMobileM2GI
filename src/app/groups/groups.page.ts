import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {AlertController, IonList, LoadingController} from '@ionic/angular';
import {AuthServiceProvider} from '../providers/auth-service.provider';
import {Router} from '@angular/router';
import * as firebase from 'firebase';
import {Group} from '../models/group';
import {MembershipServiceProvider} from '../providers/membership-service.provider';
import {Membership} from '../models/membership';

@Component({
  selector: 'app-group',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit, OnDestroy {

    groups: Group[];
    groupsToDisplay: Group[];
    joinedMemberships: Membership[];
    pendingMemberships: Membership[];
    ownerships: Membership[];
    firstHalfMemberships: Membership[];
    secondHalfMemberships: Membership[];
    groupsReady = [false, false, false, false, false, false];
    numberOfUsers = {};
    subscriptions: Subscription[] = [];
    fullControl = true;
    someControl = false;
    smallControl = false;
    noControl = false;

    @ViewChild('slidingList') slidingList: IonList;

    constructor(
        private membershipService: MembershipServiceProvider,
        private authService: AuthServiceProvider,
        private router: Router,
        private alertCtrl: AlertController,
        private loadingController: LoadingController
    ) {}

    async ngOnInit() {
        const loading = await this.loadingController.create({
            message: 'Fetching groups...'
        });
        this.presentLoading(loading);
        /* fetching all the groups */
        this.subscriptions.push(this.membershipService.getAllGroups().subscribe( data => {
            if (data.length === 0) {
                loading.dismiss();
            }
            this.groups = data;
            /* for each group, we retrieve the number of its users */
            for (const group of this.groups) {
                this.membershipService.getAllUsersInGroup(group.uuid).subscribe(memberships => {
                    this.numberOfUsers[group.uuid] = memberships.length;
                    this.groupsReady[0] = true;
                }, () => {
                    loading.dismiss();
                });
            }
            /* we retrieve every type of groups: others, joined, owned and pending */
            this.subscriptions.push(this.membershipService
                .getFirstHalf(firebase.auth().currentUser.uid).subscribe( firstHalfMemberships => {
                    this.firstHalfMemberships = firstHalfMemberships;
                    this.groupsReady[1] = true;
                    this.subscriptions.push(this.membershipService
                        .getSecondHalf(firebase.auth().currentUser.uid).subscribe( secondHalfMemberships => {
                            this.secondHalfMemberships = secondHalfMemberships;
                            this.groupsReady[2] = true;
                            this.subscriptions.push(this.membershipService
                                .getJoinedGroups(firebase.auth().currentUser.uid)
                                .subscribe(joinedMemberships => {
                                    this.joinedMemberships = joinedMemberships;
                                    this.groupsReady[3] = true;
                                    this.subscriptions.push(this.membershipService
                                        .getMyGroups(firebase.auth().currentUser.uid)
                                        .subscribe( ownerships => {
                                            this.ownerships = ownerships;
                                            this.groupsToDisplay = this.getMyGroups();
                                            this.groupsReady[4] = true;
                                            this.subscriptions.push(this.membershipService
                                                .getPendingGroups(firebase.auth().currentUser.uid)
                                                .subscribe( pendingMemberships => {
                                                    this.pendingMemberships = pendingMemberships;
                                                    this.groupsReady[5] = true;
                                                    loading.dismiss();
                                                }, () => {
                                                    loading.dismiss();
                                                }));
                                        }, () => {
                                            loading.dismiss();
                                        }));
                                }, () => {
                                    loading.dismiss();
                                }));
                        }, () => {
                            loading.dismiss();
                        }));
                }, () => {
                    loading.dismiss();
                }));
        }, () => {
            loading.dismiss();
        }));
    }

    /**
     * checks whether the fetching process is finished or not.
     * @return boolean
     */
    groupsAreReady(): boolean {
        for (const isReady of this.groupsReady) {
          if (isReady === false) {
            return false;
          }
        }
        return true;
    }

    /**
     * loops through the retrieved other memberships (which are in two parts) and returns the groups suitable for display.
     * @return Group[]
     */
    getOtherGroups(): Group[] {
        const groups = [];
        for (let i = 0; i < this.groups.length; i++) {
            for (const membership of this.firstHalfMemberships) {
                if (this.groups[i].uuid === membership.groupId) {
                    if (this.existsAsGroup(groups, this.groups[i].uuid) === false) {
                        groups.push(this.groups[i]);
                    }
                }
            }
        }
        for (let i = 0; i < this.groups.length; i++) {
            for (const membership of this.secondHalfMemberships) {
                if (this.groups[i].uuid === membership.groupId) {
                    if (this.existsAsGroup(groups, this.groups[i].uuid) === false) {
                        groups.push(this.groups[i]);
                    }
                }
            }
        }
        return groups;
    }

    /**
     * loops through the retrieved joined memberships and returns the groups suitable for display.
     * @return Group[]
     */
    getJoinedGroups(): Group[] {
      const groups = [];
      for (let i = 0; i < this.groups.length; i++) {
        for (const membership of this.joinedMemberships) {
          if (this.groups[i].uuid === membership.groupId) {
              if (this.existsAsGroup(groups, this.groups[i].uuid) === false) {
                  groups.push(this.groups[i]);
              }
          }
        }
      }
      return groups;
    }

    /**
     * loops through the retrieved owned memberships and returns the groups suitable for display.
     * @return Group[]
     */
    getMyGroups(): Group[] {
        const groups = [];
        for (let i = 0; i < this.groups.length; i++) {
            for (const ownership of this.ownerships) {
                if (this.groups[i].uuid === ownership.groupId) {
                    if (this.existsAsGroup(groups, this.groups[i].uuid) === false) {
                        groups.push(this.groups[i]);
                    }
                }
            }
        }
        return groups;
    }

    /**
     * loops through the retrieved pending memberships and returns the groups suitable for display.
     * @return Group[]
     */
    getPendingGroups(): Group[] {
        const groups = [];
        for (let i = 0; i < this.groups.length; i++) {
            for (const membership of this.pendingMemberships) {
                if (this.groups[i].uuid === membership.groupId) {
                    if (this.existsAsGroup(groups, this.groups[i].uuid) === false) {
                        groups.push(this.groups[i]);
                    }
                }
            }
        }
        return groups;
    }

    /**
     * shows an alert box confirming the deletion of a group, which would then be deleted using a CRUD service (based on firebase).
     * @param group
     */
    async removeGroup(group: Group) {
        const alert = await this.alertCtrl.create({
            header: 'Confirm!',
            message: 'Are you sure want to delete the group \'' + group.name + '\'?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('cancel');
                    }
                }, {
                    text: 'Delete',
                    handler: () => {
                        this.membershipService.deleteMemberships(group.uuid);
                        this.membershipService.deleteGroup(group.uuid);
                    }
                }
            ]
        });
        await alert.present();
        await this.slidingList.closeSlidingItems();
    }

    /**
     * shows an alert box with required fields for the creation of a new group, afterwards calls a CRUD service (based on firebase).
     */
    async createGroup() {
        const alert = await this.alertCtrl.create({
            header: 'Creating a groups',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'Group name'
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('cancel');
                    }
                }, {
                    text: 'Create',
                    handler: data => {
                        if (data.name !== '') {
                                const id = this.membershipService.makeId();
                                this.membershipService.addGroup({
                                    uuid : id,
                                    name : data.name
                                });
                                this.membershipService.addMembership({
                                    userId: firebase.auth().currentUser.uid,
                                    groupId: id,
                                    hasMembership: true,
                                    isOwner: true,
                                    date: Date.now()
                                });
                        } else {
                            this.authService.showToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    /**
     * shows an alert box with required fields for the modification of an existing group,
     * afterwards calls a CRUD service (based on firebase).
     * @param group
     */
    async modifyGroup(group: Group) {
        const alert = await this.alertCtrl.create({
            header: 'Modifying a groups',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    value: group.name
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('cancel');
                    }
                }, {
                    text: 'Modify',
                    handler: data => {
                        if (data.name !== '') {
                                this.membershipService.editGroup({
                                    uuid : group.uuid,
                                    name : data.name
                                });
                        } else {
                            this.authService.showToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
        await this.slidingList.closeSlidingItems();
    }

    /**
     * triggered when choosing a filter (others, owned, pending or joined) from the ion-select options
     * @param event
     */
    onSelectFilter(event) {
        if (this.slidingList) {
            this.slidingList.closeSlidingItems();
        }
        if (event.detail.value === 'others') {
            this.noControl = false;
            this.smallControl = true;
            this.someControl = false;
            this.fullControl = false;
            this.groupsToDisplay = this.getOtherGroups();
        } else if (event.detail.value === 'owned') {
            this.noControl = false;
            this.fullControl = true;
            this.someControl = false;
            this.smallControl = false;
            this.groupsToDisplay = this.getMyGroups();
        } else if (event.detail.value === 'pending') {
            this.noControl = true;
            this.fullControl = false;
            this.someControl = false;
            this.smallControl = false;
            this.groupsToDisplay = this.getPendingGroups();
        } else if (event.detail.value === 'joined') {
            this.noControl = false;
            this.someControl = true;
            this.smallControl = false;
            this.fullControl = false;
            this.groupsToDisplay = this.getJoinedGroups();
        }
    }

    /**
     * navigates to a group's page
     * @param group
     */
    viewGroup(group: Group) {
        this.router.navigate(['/group'], {queryParams: {id: group.uuid}});
    }

    /**
     * using a CRUD service, this function sends a request to join a group, which would be received by the owner.
     * @param group
     */
    joinGroup(group: Group) {
        this.membershipService.getMembership(firebase.auth().currentUser.uid, group.uuid).subscribe( async membership => {
            if (!membership) {
                this.membershipService.addMembership({
                    userId: firebase.auth().currentUser.uid,
                    groupId: group.uuid,
                    hasMembership: false,
                    isOwner: false,
                    date: Date.now()
                });
            }
        });
        this.slidingList.closeSlidingItems();
    }

    /**
     * shows an alert box confirming leaving a group, which would result in deleting a
     * membership using a CRUD service (based on firebase).
     * @param group
     */
    async quitGroup(group: Group) {
        const alert = await this.alertCtrl.create({
            header: 'Confirm!',
            message: 'Are you sure want to quit the group \'' + group.name + '\'?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: () => {
                        console.log('cancel');
                    }
                }, {
                    text: 'Quit',
                    handler: () => {
                        this.membershipService.deleteMembership(firebase.auth().currentUser.uid, group.uuid);
                    }
                }
            ]
        });
        await alert.present();
        await this.slidingList.closeSlidingItems();
    }

    async presentLoading(loading) {
        return await loading.present();
    }

    /**
     * checks whether there are duplicates in the collection of groups
     * @param groups
     * @param groupId
     */
    existsAsGroup(groups, groupId) {
        for ( let i = 0; i < groups.length; i++) {
            if (groups[i].uuid === groupId) {
                return true;
            }
        }
        return false;
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
          subscription.unsubscribe();
        }
    }

}
