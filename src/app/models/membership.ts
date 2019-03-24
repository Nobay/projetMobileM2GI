/**
 *  a membership is a many to many relationship concerning a group and a user, it defines a user
 *  by his status (owner, member or just a pending member) regarding a group
 */
export interface Membership {
    userId: string;
    groupId: string;
    hasMembership: boolean;
    isOwner: boolean;
    date: number;
}
