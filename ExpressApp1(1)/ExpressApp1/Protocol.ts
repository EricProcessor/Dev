import { Guid } from "./core/guid";

export enum ButtonAction {
    DismissAndStartGame = 'DismissAndStartGame',
    DismissAndExitGame =  'DismissAndExitGame'
}

export interface PopupExperience {
    id: string;
    title: string;
    text: string;
    hyperlinkIntroText: string; // this is optional
    hyperlink: string;
    hyperlinkLabel: string;
    okButtonAction: ButtonAction;
    // Given the old state, updates to the new state. Leaving this empty indicates no state change was necessary for this
    transformExperienceState: (string)=>string;
}

export interface SignInResult {
    isValid: boolean;
    isLicensed: boolean;
    isNewUser: boolean;
    trialsRemaining: number;
    role: string;
    tenantId: string;
    name: string;
    skin: string;
    acceptedEula?: boolean;
    oid: string;
    nickname: string;
    signedToken: string;
    clientSettings: string;
    popup?: PopupExperience;
}

export interface SignInResultEarlyAccess {
    isValid: boolean;
    trialEligible: boolean;
    role: string;
    tenantId: string;
    unique_name: string;
    name: string;
    skin: string;
    acceptedEula?: boolean;

    // An example SignInResult
    // "isValid": true,
    // "trialEligible": true,
    // "role": "student",
    // "tenantId": "f873649e-3bb8-4b80-8bb1-5005df979ade",
    // "unique_name": "bjohnson@school.edu",
    // "name": "Bob Johnson,
    // "skin": "EduSkins_Alex"
}