import { uiMessage } from "../helpers/ui.js";
import { copy } from "../helpers/copy.js";

export function startNeedRegMessage(firstName: string) {
  return uiMessage([
    copy.ui.start.needReg.title(firstName),
    "",
    copy.ui.start.needReg.text,
    "",
    copy.ui.common.hint(copy.ui.start.needReg.hint),
  ]);
}

export function startRegisteredNoTeacherMessage() {
  return uiMessage([
    copy.ui.start.registeredNoTeacher.title,
    "",
    copy.ui.start.registeredNoTeacher.text,
    "",
    copy.ui.common.hint(copy.ui.start.registeredNoTeacher.hint),
  ]);
}

export function startActiveStudentMessage(firstName: string) {
  return uiMessage([
    copy.ui.start.activeStudent.title(firstName),
    "",
    copy.ui.start.activeStudent.text,
  ]);
}
