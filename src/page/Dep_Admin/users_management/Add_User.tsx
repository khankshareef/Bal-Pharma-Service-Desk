import { useState } from "react";
import { FiArrowLeft, FiGlobe, FiInfo, FiSave } from "react-icons/fi";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import Reusable_Button from "../../../component/button/Reusable_Button";
import Reusable_Field from "../../../component/fields/Reusable_Field";


const Add_User = () => {
  const [status, setStatus] = useState("Active");

  return (
    <div className="max-w-full mx-auto font-sans">
      <div className="mb-8">
        <button 
                  onClick={() => window.history.back()} 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
                >
                  <FiArrowLeft size={18} />
                  <span className="font-medium">Back to Tickets</span>
                </button>
        <h1 className="text-2xl font-bold text-[#002D5B]">Add User</h1>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-8">
        <div className="bg-[#F4F8FB] border border-[#E1EAF4] rounded-xl p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-[#003D8C] font-semibold text-sm pl-2">
            <HiOutlineOfficeBuilding size={18} />
            Assign to Unit:
          </div>
          
          <div className="w-[300px]">
            <Reusable_Field
              type="select"
              options={[
                { label: "Select Unit(s)", value: "" },
                { label: "Unit 1: BommaSandra", value: "unit1" },
                { label: "Unit 2: BommaSandra", value: "unit2" },
              ]}
              className="!pt-0" 
            />
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm ml-4">
            <FiGlobe size={16} />
            Super Manager can assign users to any unit
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6">User Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Reusable_Field
              label="Employee ID *"
              placeholder="Enter employee ID"
            />
            
            <Reusable_Field
              label="Name *"
              placeholder="Enter full name"
            />
            
            <Reusable_Field
              type="select"
              label="Role *"
              options={[
                { label: "Select Role", value: "" },
                { label: "Employee", value: "employee" },
                { label: "Exicutive", value: "exicutive" },
                { label: "Admin", value: "admin" },
                { label: "Deputy Admin", value: "deputy admin" },
              ]}
            />
            
            <Reusable_Field
              type="select"
              label="Department *"
              options={[
                { label: "Select Department", value: "" },
                { label: "IT", value: "It" },
                { label: "QA", value: "qa" },
                { label: "Production", value: "production" },
                { label: "Finance", value: "finance" },
                { label: "Hr", value: "hr" },
              ]}
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 mb-3 ml-1">
              Status *
            </label>
            <div className="flex items-center gap-6 ml-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${status === 'Active' ? 'border-[#003D8C]' : 'border-gray-400 group-hover:border-[#003D8C]'}`}>
                  {status === 'Active' && <div className="w-2 h-2 rounded-full bg-[#003D8C]"></div>}
                </div>
                <input 
                  type="radio" 
                  name="status" 
                  value="Active" 
                  className="hidden"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                />
                <span className="text-[15px] font-medium text-gray-800">Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${status === 'Inactive' ? 'border-[#003D8C]' : 'border-gray-400 group-hover:border-[#003D8C]'}`}>
                  {status === 'Inactive' && <div className="w-2 h-2 rounded-full bg-[#003D8C]"></div>}
                </div>
                <input 
                  type="radio" 
                  name="status" 
                  value="Inactive" 
                  className="hidden"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                />
                <span className="text-[15px] font-medium text-gray-800">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-start gap-3 mt-4">
          <div className="mt-0.5 text-black">
            <FiInfo size={16} className="fill-black text-white" />
          </div>
          <p className="text-sm text-gray-700">
            Password is managed separately per policy. Employees & Executives cannot reset own passwords. Super Manager handles resets for all units.
          </p>
        </div>

        <div className="flex gap-4 mt-2">
          <Reusable_Button 
            variant="secondary"
            className="!text-gray-600 !border-gray-300 !bg-white hover:!bg-gray-50 rounded-full px-8" 
          >
            Cancel
          </Reusable_Button>
          
          <Reusable_Button 
            variant="primary"
            leftIcon={<FiSave size={18} />}
            className="rounded-full px-6"
          >
            Create User
          </Reusable_Button>
        </div>

      </div>
    </div>
  );
};

export default Add_User;