import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import Select from "react-select";

export const SearchForm = ({ filterOptions, setFilterOptions,
  vendorList,
  selectedVendorName,
  vendorTagList,
  selectedVendorTag,
  vendorMappingList,
  selectedVendorMapping,
  setSelectedVendorMapping,
  setSelectedVendorTag,
  setSelectedVendorName,
  setVendorTagList,
  setVendorList

}: any) => {
  const ref: any = useRef(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name) {
      setFilterOptions((prevVal: any) => ({
        ...prevVal,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <>
      <div className="search-form-container p-4">
        <div className="search-form-wrapper">
          <div className="form-group d-flex mb-2">
            <label htmlFor="SearchByFrom" className="d-flex align-items-center">
              From:{" "}
            </label>
            <input
              ref={ref}
              type="SearchByFrom"
              name="SearchByFrom"
              value={filterOptions?.SearchByFrom}
              onChange={handleChange}
              className="form-control"
              id="SearchByFrom"
              aria-describedby="SearchByFromHelp"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label
              htmlFor="SearchByTo_CC"
              className="d-flex align-items-center"
            >
              To:{" "}
            </label>
            <input
              type="SearchByTo_CC"
              name="SearchByTo_CC"
              value={filterOptions?.SearchByTo_CC}
              onChange={handleChange}
              className="form-control"
              id="SearchByTo_CC"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label
              htmlFor="SearchSubject"
              className="d-flex align-items-center"
            >
              Subject:{" "}
            </label>
            <input
              type="SearchSubject"
              name="SearchSubject"
              value={filterOptions?.SearchSubject}
              onChange={handleChange}
              className="form-control"
              id="SearchSubject"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="SearchWords" className="d-flex align-items-center">
              Includes:{" "}
            </label>
            <input
              type="SearchWords"
              name="SearchWords"
              value={filterOptions?.SearchWords}
              onChange={handleChange}
              className="form-control"
              id="SearchWords"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label
              htmlFor="AttachmentSize"
              className="d-flex align-items-center"
            >
              Size:{" "}
            </label>
            <input
              type="AttachmentSize"
              name="AttachmentSize"
              value={filterOptions?.AttachmentSize}
              onChange={handleChange}
              className="form-control"
              id="AttachmentSize"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="StartDate" className="d-flex align-items-center">
              Start Date:{" "}
            </label>
            <input
              type="date"
              name="StartDate"
              value={filterOptions?.StartDate}
              onChange={handleChange}
              className="form-control"
              id="StartDate"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="EndDate" className="d-flex align-items-center">
              End Date:{" "}
            </label>
            <input
              type="date"
              name="EndDate"
              value={filterOptions?.EndDate}
              onChange={handleChange}
              className="form-control"
              id="EndDate"
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="EndDate" className="d-flex align-items-center">
              File Extention:{" "}
            </label>
            <input
              type="FileExtention"
              name="FileExtention"
              value={filterOptions?.FileExtention}
              onChange={handleChange}
              className="form-control"
              id="FileExtention"
              style={{ marginLeft: "15px" }}
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="EndDate" className="d-flex align-items-center">
              Vendor Mapping:{" "}
            </label>
            <Select
              options={vendorMappingList?.map((res: any) => {
                return {
                  value: res.mappingtype,
                  label: res.mappingtype,
                  res: res,
                };
              })}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  width: 200,
                }),
              }}
              isClearable
              onChange={(e: any) => {
                setSelectedVendorMapping(e);
                if (e) {
                  setVendorList(e.res.CompanyNames);
                }
              }}
              placeholder={"Vendor Mapping"}
              value={
                selectedVendorMapping?.value ? selectedVendorMapping : null
              }
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="EndDate" className="d-flex align-items-center">
              Vendor Name:{" "}
            </label>
            <Select
              options={vendorList?.map((res: any) => {
                return {
                  value: res.company,
                  label: res.company,
                  res: res,
                };
              })}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  width: 200,
                }),
              }}
              placeholder={"Vendor Name"}
              onChange={(e: any) => {
                setSelectedVendorName(e);
                if (e) {
                  setVendorTagList(e.res.Tagnames);
                }
              }}
              isClearable
              value={selectedVendorName?.value ? selectedVendorName : null}
            />
          </div>
          <div className="form-group d-flex mb-2">
            <label htmlFor="EndDate" className="d-flex align-items-center">
              Vendor Tag:{" "}
            </label>
            <Select
              options={vendorTagList?.map((res: any) => {
                return { value: res.tagname, label: res.tagname };
              })}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  width: 200,
                }),
              }}
              isClearable
              onChange={(e: any) => {
                setSelectedVendorTag(e);
              }}
              placeholder={"Vendor Tag"}
              value={selectedVendorTag?.value ? selectedVendorTag : null}
            />
          </div>
        </div>
      </div>
    </>
  );
};
