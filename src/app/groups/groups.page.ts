import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TodoList} from '../models/todoList';
import {Subscription} from 'rxjs';
import {AlertController, IonList, ToastController} from '@ionic/angular';
import {TodoServiceProvider} from '../providers/todo-service.provider';
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
    currentMembership: Membership;
    groupsReady = [false, false, false, false, false, false];
    numberOfUsers = {};
    subscriptions: Subscription[] = [];
    fullControl = false;
    someControl = false;
    smallControl = false;

    @ViewChild('slidingList') slidingList: IonList;

    constructor(
        private membershipService: MembershipServiceProvider,
        private authService: AuthServiceProvider,
        private router: Router,
        private alertCtrl: AlertController
    ) {}

    ngOnInit() {
        this.subscriptions.push(this.membershipService.getAllGroups().subscribe( data => {
            this.groups = data;
            for (const group of this.groups) {
                this.membershipService.getAllUsersInGroup(group.uuid).subscribe(memberships => {
                    this.numberOfUsers[group.uuid] = memberships.length;
                    this.groupsReady[0] = true;
                });
            }
        }));
        this.subscriptions.push(this.membershipService
            .getFirstHalf(firebase.auth().currentUser.uid).subscribe( memberships => {
            this.firstHalfMemberships = memberships;
            console.log(this.firstHalfMemberships);
            this.groupsReady[1] = true;
        }));
        this.subscriptions.push(this.membershipService
            .getSecondHalf(firebase.auth().currentUser.uid).subscribe( memberships => {
                this.secondHalfMemberships = memberships;
                console.log(this.secondHalfMemberships);
                this.groupsReady[2] = true;
            }));
        this.subscriptions.push(this.membershipService
            .getJoinedGroups(firebase.auth().currentUser.uid).subscribe( memberships => {
            this.joinedMemberships = memberships;
            this.groupsToDisplay = this.getJoinedGroups();
            this.groupsReady[3] = true;
        }));
        this.subscriptions.push(this.membershipService
            .getMyGroups(firebase.auth().currentUser.uid).subscribe( memberships => {
            this.ownerships = memberships;
            this.groupsReady[4] = true;
        }));
        this.subscriptions.push(this.membershipService
            .getPendingGroups(firebase.auth().currentUser.uid).subscribe( memberships => {
            this.pendingMemberships = memberships;
            this.groupsReady[5] = true;
        }));
    }

    groupsAreReady(): boolean {
        for (const isReady of this.groupsReady) {
          if (isReady === false) {
            return false;
          }
        }
        return true;
    }

    getOtherGroups(): Group[] {
        const groups = [];
        for (let i = 0; i < this.groups.length; i++) {
            for (const membership of this.firstHalfMemberships) {
                if (this.groups[i].uuid === membership.groupId) {
                    groups.push(this.groups[i]);
                }
            }
        }
        for (let i = 0; i < this.groups.length; i++) {
            for (const membership of this.secondHalfMemberships) {
                if (this.groups[i].uuid === membership.groupId) {
                    groups.push(this.groups[i]);
                }
            }
        }
        return groups;
    }

    getJoinedGroups(): Group[] {
      const groups = [];
      for (let i = 0; i < this.groups.length; i++) {
        for (const membership of this.joinedMemberships) {
          if (this.groups[i].uuid === membership.groupId) {
              groups.push(this.groups[i]);
          }
        }
      }
      return groups;
    }

    getMyGroups(): Group[] {
        const groups = [];
        for (let i = 0; i < this.groups.length; i++) {
            for (const ownership of this.ownerships) {
                if (this.groups[i].uuid === ownership.groupId) {
                    groups.push(this.groups[i]);
                }
            }
        }
        return groups;
    }

    getPendingGroups(): Group[] {
        const groups = [];
        for (let i = 0; i < this.groups.length; i++) {
            for (const membership of this.pendingMemberships) {
                if (this.groups[i].uuid === membership.groupId) {
                    groups.push(this.groups[i]);
                }
            }
        }
        return groups;
    }

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

    async createGroup() {
        const alert = await this.alertCtrl.create({
            header: 'Creating a groups',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'Group name'
                },
                {
                    name: 'size',
                    type: 'number',
                    placeholder: 'Max size'
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
                            if (data.size <= 12 && data.size > 0) {
                                const id = this.membershipService.makeId();
                                this.membershipService.addGroup({
                                    uuid : id,
                                    name : data.name,
                                    maxSize : data.size
                                });
                                this.membershipService.addMembership({
                                    userId: firebase.auth().currentUser.uid,
                                    groupId: id,
                                    hasMembership: true,
                                    isOwner: true,
                                    date: Date.now()
                                });
                                this.groupsToDisplay.push({
                                    uuid : id,
                                    name : data.name,
                                    maxSize : data.size
                                });
                            } else {
                                this.authService.showToast('The size should be within the respected range [0-12]');
                            }
                        } else {
                            this.authService.showToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    async modifyGroup(group: Group) {
        const alert = await this.alertCtrl.create({
            header: 'Modifying a groups',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    value: group.name
                },
                {
                    name: 'size',
                    type: 'number',
                    value: group.maxSize
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
                            if (data.size <= 12 && data.size > 0) {
                                this.membershipService.editGroup({
                                    uuid : group.uuid,
                                    name : data.name,
                                    maxSize : data.size
                                });
                            } else {
                                this.authService.showToast('The size should be within the respected range [0-12]');
                            }
                        } else {
                            this.authService.showToast('The name shouldn\'t be empty');
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    onSelectFilter(event) {
        console.log(event);
        if (event.detail.value === 'others') {
            this.groupsToDisplay = this.getOtherGroups();
            this.smallControl = true;
            this.someControl = false;
            this.fullControl = false;
        } else if (event.detail.value === 'joined') {
            this.groupsToDisplay = this.getJoinedGroups();
            this.someControl = true;
            this.smallControl = false;
            this.fullControl = false;
        } else if (event.detail.value === 'owned') {
            this.fullControl = true;
            this.someControl = false;
            this.smallControl = false;
            this.groupsToDisplay = this.getMyGroups();
        } else {
            this.fullControl = false;
            this.someControl = false;
            this.smallControl = false;
            this.groupsToDisplay = this.getPendingGroups();
        }
    }

    viewGroup(group: Group) {
        this.router.navigate(['/group'], {queryParams: {id: group.uuid}});
    }

    async joinGroup(group: Group) {
        this.membershipService.getMembership(firebase.auth().currentUser.uid, group.uuid).subscribe( async membership => {
            if (!membership.isOwner && !membership.hasMembership) {
                this.membershipService.addMembership({
                    userId: firebase.auth().currentUser.uid,
                    groupId: group.uuid,
                    hasMembership: false,
                    isOwner: false,
                    date: Date.now()
                });
            }
            await this.slidingList.closeSlidingItems();
        });
    }

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

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
          subscription.unsubscribe();
        }
    }

}
