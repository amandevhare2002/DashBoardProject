import { ChangeEvent, useEffect, useState } from "react";
import { ModalComponent } from "../../Common/Modal";
const CreateModuleForm = dynamic(() => import("./CreateModuleForm"));
import { InitalState, MainMenuItem, PannelListT } from "./constant";
const DynamicForm = dynamic(() => import("./dynamicForm"));
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

export const CreateDynamicForm = () => {
  const [selectedModule, setSelectedModule] = useState("");
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [showDynamicForm, setShowDynamicForm] = useState(false);
  const [pannelList, setPannelList] = useState<Array<PannelListT>>([]);
  const [menuItemList, setMenuItemList] = useState<Array<MainMenuItem>>([]);
  const [modulesDetails, setModulesDetails] = useState<{
    ErrorMessage: string;
    ModuleID: string;
    ModuleName: string;
    IsActive: boolean;
    MenuID: string;
    DisplayTabular: boolean;
    IsIDGenerate: boolean;
    IDPrefix: string;
    IDTypeSearch: string;
    SeoPageTitle: string;
    SeoMetaKeywords: string;
    SeoMetaDescription: string;
    SeoCopyRight: string;
    SeoContentType: string;
    SeoRobots: string;
    SeoViewPort: string;
    SeoCharset: string;
    PanelID: string;
    MainMenuID: string;
  } | null>({ ...InitalState });
  const token = useSelector((state: any) => state.authReducer.token);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      GetModuleList();
      GetPannelList();
    }
  }, [token]);

  useEffect(() => {
    if (modulesDetails?.PanelID && token) {
      GetMenuList();
    }
  }, [modulesDetails, token]);

  const GetMenuList = () => {
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/MainMenuList", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Userid: localStorage.getItem("username"),
        PanelID: `${modulesDetails?.PanelID}`,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        response?.mainMenuItems?.unshift({});
        setMenuItemList(response?.mainMenuItems);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const GetPannelList = () => {
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/GetPanelList", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Userid: localStorage.getItem("username") }),
    })
      .then((response) => response.json())
      .then((response) => {
        response?.panelLists?.unshift({});
        setPannelList(response.panelLists);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const GetModuleList = () => {
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/GetModuleList", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Userid: localStorage.getItem("username") }),
    })
      .then((response) => response.json())
      .then((response) => {
        response.modules.unshift({});
        setModules(response.modules);
        if (modulesDetails?.ModuleName) {
          const module = response.modules.find(
            (res: any) => res.ModuleName === modulesDetails?.ModuleName
          );
          if (module) {
            setSelectedModule(module.ModuleID);
            router.push({
              pathname: "/1/1",
              query: {
                mainId: modulesDetails.MainMenuID,
                menuId: modulesDetails.MenuID,
                moduleId: module.ModuleID,
                isEdit: true,
              },
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    if (selectedModule && token) {
      fetch(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetModuleDetails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Userid: localStorage.getItem("username"),
            ModuleID: selectedModule,
          }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          setModulesDetails(response);
          if (!modulesDetails?.ModuleID) {
            setIsOpenModal(true);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [selectedModule, token]);

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const state = {
      ...modulesDetails,
      [e.target.name]: e.target.value,
    };
    setModulesDetails(state as any);
  };

  const modalContent = () => {
    return (
      <CreateModuleForm
        modulesDetails={modulesDetails}
        onChangeInput={onChangeInput}
        setModulesDetails={setModulesDetails}
        pannelList={pannelList}
        menuItemList={menuItemList}
      />
    );
  };

  const SubmitModuleForm = () => {
    if (!modulesDetails?.ModuleName) {
      setShowDynamicForm(true);
      return;
    }
    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/Add_UpdateModuleDetails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...modulesDetails,
          Userid: localStorage.getItem("username"),
          ModuleID: Number(selectedModule),
          MenuID: Number(modulesDetails?.MenuID),
          PanelID: Number(modulesDetails?.PanelID),
          MainMenuID: Number(modulesDetails?.MainMenuID),
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setShowDynamicForm(true);
        GetModuleList();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <ModalComponent
        visible={isModalOpen}
        width={500}
        onSubmit={() => {
          setIsOpenModal(false);
          SubmitModuleForm();
        }}
        onClose={() => {
          setIsOpenModal(!isModalOpen);
        }}
        showFooter
        title="Module Form "
        content={modalContent}
      />
      <DynamicForm
        modulesDetails={modulesDetails}
        setAddModuleModal={setIsOpenModal}
        setModulesDetails={setModulesDetails}
        setSelectedModule={setSelectedModule}
        selectedModule={selectedModule}
        modules={modules}
        onChangeModuleInput={(e: any) => {
          const state = {
            ...modulesDetails,
            [e.target.name]: e.target.value,
          };
          setModulesDetails(state as any);
        }}
        SubmitModuleForm={SubmitModuleForm}
      />
    </>
  );
};
