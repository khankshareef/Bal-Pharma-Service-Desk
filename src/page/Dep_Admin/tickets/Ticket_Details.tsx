import { FiArrowLeft, FiCheck, FiEdit, FiKey, FiUser, FiUserX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Reusable_Button from "../../../component/button/Reusable_Button";

const Ticket_Details = () => {
    const navigate = useNavigate();
  return (
    <div className="max-w-full mx-auto font-sans min-h-screen">

        <button 
                  onClick={() => window.history.back()} 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
                >
                  <FiArrowLeft size={18} />
                  <span className="font-medium">Back to Tickets</span>
                </button>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0f2d4a]">User Details</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-[#1e4a66]">
            <FiUser size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Kumar</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              SM001 · Super Manager · IT Department · All Units
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Reusable_Button
          onClick={()=>navigate('../add-user')}
          children = "Edit"
          leftIcon = {<FiEdit size={14} />}
          variant="secondary"
          />
          <Reusable_Button
          children = "Reset Password"
          leftIcon = {<FiKey size={14} /> }
          className="flex items-center gap-2 px-5 py-2 bg-[#b85c14] border border-[#b85c14] rounded-full text-sm font-medium text-white hover:bg-[#9e4e10] transition-colors"
          />
          <Reusable_Button
          children = "Deactivate"
          leftIcon = {<FiUserX size={14} /> }
          className="flex items-center gap-2 px-5 py-2 bg-red-600 border border-red-300 rounded-full text-sm font-medium hover:bg-red-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Employee ID</p>
            <p className="text-[15px] text-gray-900 font-medium">SM001</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Full Name</p>
            <p className="text-[15px] text-gray-900 font-medium">Kumar</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Role</p>
            <p className="text-[15px] text-gray-900 font-medium">Employee</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Department</p>
            <p className="text-[15px] text-gray-900 font-medium">QA</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-2">Unit</p>
            <span className="inline-block px-3 py-0.5 bg-orange-100 text-[#a85312] text-xs font-semibold rounded-full">
              unit 2 BommaSandara
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2">Status</p>
            <span className="inline-block px-3 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              Active
            </span>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Created Date</p>
            <p className="text-[15px] text-gray-900 font-medium">07-Aug-2026</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Last Login</p>
            <p className="text-[15px] text-gray-900 font-medium">10-Aug-2026 09:15 AM</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-[17px] font-bold text-gray-900 mb-4">Account Information</h3>
        <div className="bg-[#f8f9fb] border border-gray-100 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-2">Account Status</p>
              <span className="inline-block px-3 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Active
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Password Last Reset</p>
              <p className="text-[15px] text-gray-900 font-medium">05-Aug-2026</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Reset By</p>
              <p className="text-[15px] text-gray-900 font-medium">Super Manager Kumar</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[17px] font-bold text-gray-900 mb-4">Administrative Activity</h3>
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fb] border-b border-gray-100 text-sm">
                <th className="py-3 px-6 font-semibold text-gray-700 w-[20%]">Date</th>
                <th className="py-3 px-6 font-semibold text-gray-700 w-[25%]">Action</th>
                <th className="py-3 px-6 font-semibold text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="text-[14px]">
              <tr className="border-b border-gray-100">
                <td className="py-4 px-6 text-gray-700">08-Aug-2026</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f5ea] text-[#1e7e40] text-xs font-semibold rounded-full">
                    <FiCheck size={12} /> User Created
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">Account created by Super Manager Kumar.</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-6 text-gray-700">09-Aug-2026</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f5ea] text-[#1e7e40] text-xs font-semibold rounded-full">
                    <FiCheck size={12} /> Department Updated
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">Department changed from IT to QA.</td>
              </tr>
              <tr>
                <td className="py-4 px-6 text-gray-700">09-Aug-2026</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#e5f5ea] text-[#1e7e40] text-xs font-semibold rounded-full">
                    <FiCheck size={12} /> Password Reset
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">Password reset performed by Super Manager Kumar.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default Ticket_Details;