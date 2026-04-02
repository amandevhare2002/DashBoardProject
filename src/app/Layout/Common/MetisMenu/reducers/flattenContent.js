/**
 * src/reducers/flattenContent.js
 * Author: H.Alper Tuna <halpertuna@gmail.com>
 * Date: 17.09.2016
 */

/* eslint no-param-reassign: ["error", { "props": false }] */

let uid;
const flattenLevel = (content, parentId) => {
  let flatContent = [];

  content?.forEach((item) => {
    const id = item?.MenuID || uid;
    uid += 1;
    flatContent.push({
      id,
      parentId: item?.parentId || parentId,
      icon: item?.icon,
      label: item?.label,
      to: item?.to,
      menuId: item?.menuId,
      externalLink: item?.externalLink,
      mainMenuId: item?.mainMenuId,
      active: false,
      hasActiveChild: false,
      subMenuVisibility: false,
      IsSubmenuActive: item?.IsSubmenuActive,
      SubMenuIconClsName: item?.SubMenuIconClsName,
      SubMenuSequenceNo: item?.SubMenuSequenceNo,
      SubmenuIconPathUrl: item?.SubmenuIconPathUrl,
      SubmenuName: item?.SubmenuName,
      MenuHeaderName: item?.MenuHeaderName,
      DefaultDbname: item?.DefaultDbname,
      DefaultTabname: item?.DefaultTabname,
      PathUrl: item?.PathUrl,
      HeaderID: item?.HeaderID,
      HeaderName: item?.HeaderName,
      ServerName :item?.ServerName,
      LinkURL:item?.LinkURL,
      ModuleID: item?.ModuleID
    });
    if (typeof item?.content !== "undefined") {
      flatContent = [...flatContent, ...flattenLevel(item?.content, id)];
    }
  });
  return flatContent;
};

let trace;
const mapTrace = (content, parentId) => {
  const subItems = content.filter((item) => item.parentId === parentId);
  subItems.forEach((item) => {
    item.trace = [...trace];
    trace.push(item.id);
    item.hasSubMenu = mapTrace(content, item.id);
    if (item.hasSubMenu) {
      item.to = "#";
    }
    trace.pop();
  });
  return subItems.length > 0;
};

export default (content) => {
  uid = 1;
  trace = [];
  const flatContent = flattenLevel(content);
  mapTrace(flatContent);
  return flatContent;
};
