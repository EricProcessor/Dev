import { UserID, PlatformInfo } from "./AAD";
import {PopupExperience, ButtonAction} from "./Protocol"
import { UserInfo } from "./MeeUserTable";

export class Experience {
    static isExperienceSupported(userId: UserID) {
        // TODO: Add support for checking version
        return (userId.clientApplication == "Minecraft" &&
            userId.getPlatformInfo().isAnyWin32());
    }

    static trialExperienceShown(userInfo: UserInfo, isExistingUser: boolean) : boolean {
        return (userInfo || userInfo.user) && (!userInfo.user.isLicensed) && (!isExistingUser || (userInfo.remainingTrialCount == 3) || (userInfo.remainingTrialCount < 1));
    }

    static addStateField(oldState: string, key: any, value: any): string {
        let oldStateObj = oldState != null ? JSON.parse(oldState) : {};
        oldStateObj[key] = value;
        return JSON.stringify(oldStateObj);
    }

    static getFieldFromState(state: string, key: any): any {
        return state ? JSON.parse(state)[key] : null;
    }

    static createCSExperience(id: string, text: string): PopupExperience {
        return {
            id: id,
            title: "Code Builder for Minecraft: Education Edition",
            text: text,
            hyperlinkIntroText: "",
            hyperlink: "https://education.minecraft.net/CS",
            hyperlinkLabel: "education.minecraft.net/CS",
            okButtonAction: ButtonAction.DismissAndStartGame,
            transformExperienceState: (oldState: string) => { return this.addStateField(oldState, 'csExViewed', true); }
        }
    }

    static getCSTeacherKeyboardExperience(): PopupExperience {
        return this.createCSExperience('5c466b18-7982-4b90-9a20-94901f33c2b7', 'Did you know you can write code in Minecraft? Code Builder is now available for students in game! You can press "C" to code while in a world to control the Agent with block code or JavaScript. Head to our computer science landing page for training, lesson plans, and resources on coding with Minecraft.');
    }

    static getCSStudentKeyboardExperience(): PopupExperience {
        return this.createCSExperience('2e81d886-1054-4d74-a2a4-452bf5607e5c', 'Press "C" to code! Did you know you can write code in Minecraft? Using Code Builder, you can use block coding or JavaScript to control the Agent. Head to the Minecraft Education website to find fun activities you can do while learning to code, and share with your teacher!');
    }

    static shouldShowCSExperience(userId: UserID, userInfo: UserInfo, currentDate: Date): boolean {
        return currentDate >= new Date(Date.UTC(2018, 11, 2)) &&
            !userId.getPlatformInfo().isTouch() &&
            userId.locale === 'en' &&
            this.getFieldFromState(userInfo.user.experienceState, 'csExViewed') !== true;
    }

    static getCSExperience(userId: UserID, userInfo: UserInfo): PopupExperience {
        return userInfo.user.role == "teacher" ? this.getCSTeacherKeyboardExperience() : this.getCSStudentKeyboardExperience();
    }

    static getExperience(userId: UserID, userInfo: UserInfo, isExistingUser: boolean, currentDate: Date = new Date()) {
        if (this.isExperienceSupported(userId) && userId.clientDisplayVersion == "1.6.0" && !Experience.trialExperienceShown(userInfo, isExistingUser)) {
            // TODO: Get info from blob with the following structure:
            //  Should do on client: Provide an identifier for experience being sent down.
            let result :PopupExperience = {
                id: "15d6cfc2-6418-4e1d-9910-fce5dbf61c8a",
                title: "Minecraft: Education Edition Beta",
                text: "Welcome to the Minecraft: Education Edition Beta! Thank you for your participation. We look forward to your feedback.",
                hyperlinkIntroText: "", // this is optional
                hyperlink: "https://education.minecraft.net/",
                hyperlinkLabel: "Send Feedback",
                okButtonAction: ButtonAction.DismissAndStartGame,
                transformExperienceState: null
            };

            if (userId.unique_name == "stu15@usmie.com") {
                result.text = "The Minecraft: Education Edition Beta is now closed. Thank you for your participation!";
                result.okButtonAction = ButtonAction.DismissAndExitGame;
            }

            return result;
        }
        if (this.shouldShowCSExperience(userId, userInfo, currentDate) && !Experience.trialExperienceShown(userInfo, isExistingUser)) {
            return this.getCSExperience(userId, userInfo);
        }
    }
}