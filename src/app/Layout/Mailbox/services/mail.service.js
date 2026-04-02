import { useEffect, useRef } from "react";

import BaseService from "./base.service";

export function useMailService(token) {
  let mailService = useRef(new MailServices(token));
  useEffect(() => {
    mailService.current = new MailServices(token);
  }, [token]);

  return mailService.current;
}

class MailServices extends BaseService {
  constructor(token) {
    super(token);
  }

  getMailFolders = async () => {
    return await this._callApi(
      "POST",
      "/api/Login/GetMailFolderList",
      undefined,
      {
        Userid: localStorage.getItem("username"),
      }
    );
  };

  getMails = async (mailboxType) =>
    await this._callApi("POST", "/api/Login/GetMailList", undefined, {
      Userid: localStorage.getItem("username"),
      EmailID: localStorage.getItem('mailUserId'),
      MailboxType: mailboxType,
    });

  getMessageDetails = async (msgNum, folderName) =>
    await this._callApi("POST", "/api/Login/GetMessageDetails", undefined, {
      Userid: localStorage.getItem("username"),
      Msgnum: msgNum,
      FolderName: folderName,
      EmailID: localStorage.getItem('mailUserId')
    });

  deleteEmail = async (mails) =>
    await this._callApi("POST", "/api/Login/DeleteEmail", undefined, {
      Userid: localStorage.getItem("username"),
      delEmailLists: mails,
      EmailID: localStorage.getItem('mailUserId')
    });

  searchEmail = async (searchOptions) =>
    await this._callApi("POST", "/api/Login/FilterEmails", undefined, {
      Userid: localStorage.getItem("username"),
      EmailID: localStorage.getItem('mailUserId'),
      ...searchOptions,
    });

  autoFillEmail = async (text) =>
    await this._callApi("POST", "/api/Login/GetAutoFillTo_CC", undefined, {
      Userid: localStorage.getItem("username"),
      SearchKeyword: text,
      EmailID: localStorage.getItem('mailUserId')
    });

  sendEmail = async (body) =>
    await this._callApi("POST", "/api/Login/SendEmail", undefined, {
      Userid: localStorage.getItem("username"),
      ...body,
      EmailID: localStorage.getItem('mailUserId')
    });

  getHtmlContent = async (filepath) =>
    await this._callApi("POST", "/api/Login/ViewhtmlBody", undefined, {
      Userid: localStorage.getItem("username"),
      Filepath: filepath,
      EmailID: localStorage.getItem('mailUserId')
    });

  createMailFolder = async (Folderpath) =>
    await this._callApi("POST", "/api/Login/CreateMailFolder", undefined, {
      Userid: localStorage.getItem("username"),
      Folderpath,
      EmailID: localStorage.getItem('mailUserId')
    });

  deleteMailFolder = async (Folderpath) =>
    await this._callApi("POST", "/api/Login/DeleteMailFolder", undefined, {
      Userid: localStorage.getItem("username"),
      Folderpath,
      EmailID: localStorage.getItem('mailUserId')
    });

  moveMailFolder = async (Oldfolderpath, Newfolderpath) =>
    await this._callApi("POST", "/api/Login/MoveMailFolder", undefined, {
      Userid: localStorage.getItem("username"),
      Oldfolderpath,
      Newfolderpath,
      EmailID: localStorage.getItem('mailUserId')
    });

  shiftMail = async (mails) =>
    await this._callApi("POST", "/api/Login/ShiftEmail", undefined, {
      Userid: localStorage.getItem("username"),
      shiftmaillist: mails,
      EmailID: localStorage.getItem('mailUserId')
    });
}
