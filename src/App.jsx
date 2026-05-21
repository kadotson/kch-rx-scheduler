import React, { useMemo, useState } from "react";
import { AlertCircle, Bell, Briefcase, Building2, CalendarDays, CheckCircle2, ClipboardList, Download, Hand, Lock, Plane, Plus, Repeat, User, UserCog, Wand2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const employeesSeed = [
  { id: 1, name: "Amy", jobTitle: "Technician", homeLocation: "Sandpoint Pharmacy", eligibleLocations: ["Sandpoint Pharmacy"], ptoBalance: 72 },
  { id: 2, name: "Megan", jobTitle: "Pharmacist", homeLocation: "Sandpoint Pharmacy", eligibleLocations: ["Sandpoint Pharmacy", "Priest River"], ptoBalance: 96 },
  { id: 3, name: "Jordan", jobTitle: "Technician", homeLocation: "Priest River", eligibleLocations: ["Priest River"], ptoBalance: 48 },
  { id: 4, name: "Taylor", jobTitle: "Technician", homeLocation: "Sandpoint Pharmacy", eligibleLocations: ["Sandpoint Pharmacy", "Priest River"], ptoBalance: 40 },
  { id: 5, name: "Riley", jobTitle: "Pharmacist", homeLocation: "Priest River", eligibleLocations: ["Sandpoint Pharmacy", "Priest River"], ptoBalance: 88 },
];

const locationsSeed = ["Sandpoint Pharmacy", "Priest River"];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const specialRoles = ["Dispensing", "Inventory", "340B Audit", "Clinical Support", "Training", "Admin", "Delivery Prep", "Project Work"];

const staffingNeedsSeed = {
  "Sandpoint Pharmacy": { Pharmacist: 1, Technician: 2 },
  "Priest River": { Pharmacist: 1, Technician: 1 },
};

const templateSeed = {
  Monday: { "Sandpoint Pharmacy": ["Megan", "Amy", "Taylor"], "Priest River": ["Riley", "Jordan"] },
  Tuesday: { "Sandpoint Pharmacy": ["Megan", "Amy", "Taylor"], "Priest River": ["Riley", "Jordan"] },
  Wednesday: { "Sandpoint Pharmacy": ["Megan", "Amy", "Taylor"], "Priest River": ["Riley", "Jordan"] },
  Thursday: { "Sandpoint Pharmacy": ["Megan", "Amy", "Taylor"], "Priest River": ["Riley", "Jordan"] },
  Friday: { "Sandpoint Pharmacy": ["Megan", "Amy"], "Priest River": ["Riley"] },
};

const daysSeed = [
  { date: "Mon 1/5", dayName: "Monday", tag: "", note: "" },
  { date: "Tue 1/6", dayName: "Tuesday", tag: "Payday", note: "Payroll posts" },
  { date: "Wed 1/7", dayName: "Wednesday", tag: "", note: "" },
  { date: "Thu 1/8", dayName: "Thursday", tag: "Clinic Closed", note: "Staff training day" },
  { date: "Fri 1/9", dayName: "Friday", tag: "Holiday", note: "Observed holiday" },
];

const blackoutSeed = [{ id: 301, date: "Fri 1/9", reason: "Holiday coverage required" }];
const unavailableSeed = [{ id: 401, employee: "Taylor", date: "Fri 1/9", reason: "Out of town on normal day off" }];
const ptoSeed = [
  { id: 101, employee: "Amy", startDate: "Mon 1/5", endDate: "Mon 1/5", hours: 8, reason: "Family event", status: "Pending", managerNote: "" },
  { id: 102, employee: "Jordan", startDate: "Wed 1/7", endDate: "Wed 1/7", hours: 8, reason: "Vacation", status: "Pending", managerNote: "" },
];
const bidsSeed = [{ id: 201, employee: "Taylor", day: "Thu 1/8", location: "Priest River", jobTitle: "Technician", note: "I can cover this if needed.", status: "Pending" }];
const dailyRolesSeed = {
  "Mon 1/5||Sandpoint Pharmacy||Amy": "Inventory",
  "Tue 1/6||Sandpoint Pharmacy||Megan": "340B Audit",
  "Wed 1/7||Priest River||Jordan": "Delivery Prep",
};

const buildSchedule = (days, template) => {
  const output = {};
  days.forEach((day) => {
    output[day.date] = JSON.parse(JSON.stringify(template[day.dayName] || {}));
  });
  return output;
};

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    yellow: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
    dark: "bg-slate-900 text-white border-slate-900",
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function Button({ children, onClick, tone = "dark", disabled = false }) {
  const tones = {
    dark: "bg-slate-900 text-white hover:bg-slate-800",
    green: "bg-emerald-600 text-white hover:bg-emerald-700",
    red: "bg-rose-600 text-white hover:bg-rose-700",
    light: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
  };
  return <button disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}>{children}</button>;
}

function Field({ label, children }) {
  return <label className="block space-y-1"><span className="text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

const inputClass = () => "w-full rounded-xl border border-slate-300 bg-white p-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-2"><Icon className="h-5 w-5 text-slate-700" /></div>
        <div><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div>
      </div>
      {children}
    </motion.div>
  );
}

export default function EmployeeSchedulingApp() {
  const [activeTab, setActiveTab] = useState("manager");
  const [employees] = useState(employeesSeed);
  const [locations] = useState(locationsSeed);
  const [days, setDays] = useState(daysSeed);
  const [weeklyTemplate, setWeeklyTemplate] = useState(templateSeed);
  const [schedule, setSchedule] = useState(buildSchedule(daysSeed, templateSeed));
  const [dailyRoles, setDailyRoles] = useState(dailyRolesSeed);
  const [staffingNeeds, setStaffingNeeds] = useState(staffingNeedsSeed);
  const [ptoRequests, setPtoRequests] = useState(ptoSeed);
  const [shiftBids, setShiftBids] = useState(bidsSeed);
  const [blackoutDays] = useState(blackoutSeed);
  const [unavailableDays, setUnavailableDays] = useState(unavailableSeed);
  const [alerts, setAlerts] = useState([
    { id: 1, recipients: ["Amy", "Megan", "Jordan", "Taylor", "Riley"], type: "System", title: "Welcome", message: "In-app alerts are active. No SMS/text alerts are used.", readBy: [] },
  ]);

  const [employeeName, setEmployeeName] = useState("Amy");
  const [startDate, setStartDate] = useState("Mon 1/5");
  const [endDate, setEndDate] = useState("Mon 1/5");
  const [hours, setHours] = useState(8);
  const [reason, setReason] = useState("Personal day");
  const [managerNote, setManagerNote] = useState("");
  const [assignDay, setAssignDay] = useState("Mon 1/5");
  const [assignLocation, setAssignLocation] = useState("Sandpoint Pharmacy");
  const [assignEmployee, setAssignEmployee] = useState("Amy");
  const [coverageReason, setCoverageReason] = useState("Coverage adjustment");
  const [roleDay, setRoleDay] = useState("Mon 1/5");
  const [roleLocation, setRoleLocation] = useState("Sandpoint Pharmacy");
  const [roleEmployee, setRoleEmployee] = useState("Amy");
  const [roleAssignment, setRoleAssignment] = useState("Inventory");
  const [unavailableEmployee, setUnavailableEmployee] = useState("Amy");
  const [unavailableDate, setUnavailableDate] = useState("Fri 1/9");
  const [unavailableReason, setUnavailableReason] = useState("Not available to cover on my normal day off");
  const [templateDay, setTemplateDay] = useState("Monday");
  const [templateLocation, setTemplateLocation] = useState("Sandpoint Pharmacy");
  const [templateEmployee, setTemplateEmployee] = useState("Amy");
  const [needLocation, setNeedLocation] = useState("Sandpoint Pharmacy");
  const [needJobTitle, setNeedJobTitle] = useState("Technician");
  const [needCount, setNeedCount] = useState(2);
  const [bidEmployee, setBidEmployee] = useState("Amy");
  const [bidShiftKey, setBidShiftKey] = useState("");
  const [bidNote, setBidNote] = useState("I can cover this shift.");

  const getJobTitle = (name) => employees.find((employee) => employee.name === name)?.jobTitle || "Other";
  const selectedEmployee = employees.find((employee) => employee.name === employeeName) || employees[0];
  const selectedBidEmployee = employees.find((employee) => employee.name === bidEmployee) || employees[0];
  const roleKey = (day, location, employee) => `${day}||${location}||${employee}`;
  const roleFor = (day, location, employee) => dailyRoles[roleKey(day, location, employee)] || "Dispensing";
  const isDateBlocked = (date) => blackoutDays.some((day) => day.date === date);
  const isEmployeeUnavailable = (employee, date) => unavailableDays.some((item) => item.employee === employee && item.date === date);
  const selectedDatesBlocked = isDateBlocked(startDate) || isDateBlocked(endDate);
  const statusTone = (status) => status === "Approved" ? "green" : status === "Denied" ? "red" : "yellow";
  const tagTone = (tag) => tag === "Holiday" ? "purple" : tag === "Clinic Closed" ? "red" : tag === "Payday" ? "green" : "default";

  const pushAlert = ({ recipients, type, title, message }) => {
    const uniqueRecipients = [...new Set(recipients.filter(Boolean))];
    if (!uniqueRecipients.length) return;
    setAlerts((prev) => [{ id: Date.now(), recipients: uniqueRecipients, type, title, message, readBy: [] }, ...prev].slice(0, 60));
  };

  const markAlertRead = (id, employee) => setAlerts((prev) => prev.map((alert) => alert.id === id ? { ...alert, readBy: [...new Set([...alert.readBy, employee])] } : alert));

  const employeeAlerts = alerts.filter((alert) => alert.recipients.includes(employeeName));
  const unreadEmployeeAlerts = employeeAlerts.filter((alert) => !alert.readBy.includes(employeeName));

  const groupByJobTitle = (names) => names.reduce((acc, name) => {
    const jobTitle = getJobTitle(name);
    if (!acc[jobTitle]) acc[jobTitle] = [];
    acc[jobTitle].push(name);
    return acc;
  }, { Pharmacist: [], Technician: [] });

  const getOpenSpots = (day, location) => {
    const assignedByJob = groupByJobTitle(schedule[day]?.[location] || []);
    const needs = staffingNeeds[location] || { Pharmacist: 0, Technician: 0 };
    return ["Pharmacist", "Technician"].map((jobTitle) => ({
      day, location, jobTitle,
      open: Math.max((needs[jobTitle] || 0) - (assignedByJob[jobTitle]?.length || 0), 0),
    })).filter((spot) => spot.open > 0);
  };

  const allOpenSpots = useMemo(() => days.flatMap((day) => locations.flatMap((location) => getOpenSpots(day.date, location))), [days, locations, schedule, staffingNeeds, employees]);
  const pendingPto = ptoRequests.filter((request) => request.status === "Pending");
  const pendingBids = shiftBids.filter((bid) => bid.status === "Pending");
  const eligibleForSelectedLocation = employees.filter((employee) => employee.eligibleLocations.includes(assignLocation) && !isEmployeeUnavailable(employee.name, assignDay));
  const employeesAtRoleLocation = schedule[roleDay]?.[roleLocation] || [];

  const generateYearFromTemplate = () => {
    const generatedDays = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let dayNumber = 5;
    for (let week = 0; week < 10; week += 1) {
      weekdays.forEach((dayName, index) => {
        const monthIndex = Math.floor((dayNumber - 1) / 28);
        const dayOfMonth = ((dayNumber - 1) % 28) + 1;
        generatedDays.push({ date: `${dayName.slice(0, 3)} ${monthNames[monthIndex]}/${dayOfMonth}`, dayName, tag: week % 2 === 0 && index === 4 ? "Payday" : "", note: week % 2 === 0 && index === 4 ? "Biweekly payday" : "" });
      });
      dayNumber += 7;
    }
    setDays(generatedDays);
    setSchedule(buildSchedule(generatedDays, weeklyTemplate));
    pushAlert({ recipients: employees.map((e) => e.name), type: "Schedule", title: "Schedule generated", message: "The schedule was generated from the weekly template." });
  };

  const submitPtoRequest = () => {
    if (selectedDatesBlocked) return;
    setPtoRequests((prev) => [{ id: Date.now(), employee: employeeName, startDate, endDate, hours: Number(hours), reason, status: "Pending", managerNote: "" }, ...prev]);
    pushAlert({ recipients: [employeeName], type: "PTO", title: "PTO submitted", message: `Your PTO request for ${startDate} was submitted and is pending manager approval.` });
  };

  const updatePtoStatus = (id, status) => {
    const request = ptoRequests.find((item) => item.id === id);
    if (!request) return;
    setPtoRequests((prev) => prev.map((item) => item.id === id ? { ...item, status, managerNote: managerNote || item.managerNote } : item));
    pushAlert({ recipients: [request.employee], type: "PTO", title: `PTO ${status.toLowerCase()}`, message: `Your PTO request for ${request.startDate} was ${status.toLowerCase()}.` });
    setManagerNote("");
  };

  const applyOneTimeCoverageChange = () => {
    if (isEmployeeUnavailable(assignEmployee, assignDay)) return;
    setSchedule((prev) => {
      const current = prev[assignDay]?.[assignLocation] || [];
      if (current.includes(assignEmployee)) return prev;
      return { ...prev, [assignDay]: { ...prev[assignDay], [assignLocation]: [...current, assignEmployee] } };
    });
    pushAlert({ recipients: [assignEmployee], type: "Schedule", title: "Schedule changed", message: `You were assigned to ${assignLocation} on ${assignDay}. Reason: ${coverageReason}` });
  };

  const applyDailyRole = () => {
    setDailyRoles((prev) => ({ ...prev, [roleKey(roleDay, roleLocation, roleEmployee)]: roleAssignment }));
    pushAlert({ recipients: [roleEmployee], type: "Daily Role", title: "Daily role assigned", message: `Your role on ${roleDay} at ${roleLocation} is ${roleAssignment}.` });
  };

  const removeShift = (day, location, employee) => {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [location]: (prev[day]?.[location] || []).filter((name) => name !== employee) } }));
    pushAlert({ recipients: [employee], type: "Schedule", title: "Removed from shift", message: `You were removed from ${location} on ${day}.` });
  };

  const addUnavailableDay = () => {
    if (isEmployeeUnavailable(unavailableEmployee, unavailableDate)) return;
    setUnavailableDays((prev) => [{ id: Date.now(), employee: unavailableEmployee, date: unavailableDate, reason: unavailableReason }, ...prev]);
    pushAlert({ recipients: [unavailableEmployee], type: "Availability", title: "Unavailable day saved", message: `You are marked unavailable on ${unavailableDate}.` });
  };

  const addEmployeeToTemplate = () => setWeeklyTemplate((prev) => {
    const current = prev[templateDay]?.[templateLocation] || [];
    if (current.includes(templateEmployee)) return prev;
    return { ...prev, [templateDay]: { ...prev[templateDay], [templateLocation]: [...current, templateEmployee] } };
  });

  const updateStaffingNeed = () => setStaffingNeeds((prev) => ({ ...prev, [needLocation]: { ...(prev[needLocation] || { Pharmacist: 0, Technician: 0 }), [needJobTitle]: Number(needCount) } }));

  const submitShiftBid = () => {
    if (!bidShiftKey) return;
    const [day, location, jobTitle] = bidShiftKey.split("||");
    setShiftBids((prev) => [{ id: Date.now(), employee: bidEmployee, day, location, jobTitle, note: bidNote, status: "Pending" }, ...prev]);
    pushAlert({ recipients: [bidEmployee], type: "Open Shift", title: "Bid submitted", message: `You bid on the ${jobTitle} shift at ${location} on ${day}.` });
  };

  const updateBidStatus = (id, status) => {
    const bid = shiftBids.find((item) => item.id === id);
    if (!bid) return;
    setShiftBids((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    pushAlert({ recipients: [bid.employee], type: "Open Shift", title: `Bid ${status.toLowerCase()}`, message: `Your bid for ${bid.location} on ${bid.day} was ${status.toLowerCase()}.` });
  };

  const renderPersonCard = (day, location, name) => {
    const jobTitle = getJobTitle(name);
    const dailyRole = roleFor(day, location, name);
    return <button key={name} onClick={() => removeShift(day, location, name)} className="rounded-xl border border-slate-200 bg-white p-2 text-left shadow-sm hover:bg-slate-50"><div className="flex flex-wrap items-center gap-1"><Badge tone={jobTitle === "Pharmacist" ? "purple" : "blue"}>{name}</Badge><span className="text-xs text-slate-400">×</span></div><div className="mt-1 text-xs text-slate-500">Location: {location}</div><div className="mt-1"><Badge tone={dailyRole === "Dispensing" ? "default" : "green"}>{dailyRole}</Badge></div></button>;
  };

  const renderScheduleCell = (day, location) => {
    const grouped = groupByJobTitle(schedule[day.date]?.[location] || []);
    const openSpots = getOpenSpots(day.date, location);
    return <div className="space-y-3"><div><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Pharmacists</div><div className="flex flex-wrap gap-2">{grouped.Pharmacist.length ? grouped.Pharmacist.map((name) => renderPersonCard(day.date, location, name)) : <span className="text-xs text-slate-400">No pharmacist assigned</span>}</div></div><div><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Technicians</div><div className="flex flex-wrap gap-2">{grouped.Technician.length ? grouped.Technician.map((name) => renderPersonCard(day.date, location, name)) : <span className="text-xs text-slate-400">No technician assigned</span>}</div></div>{openSpots.length > 0 && <div className="space-y-1 rounded-xl bg-amber-50 p-2 text-xs text-amber-800 ring-1 ring-amber-200">{openSpots.map((spot) => <div key={`${spot.day}-${spot.location}-${spot.jobTitle}`}>Open: {spot.open} {spot.jobTitle} spot{spot.open > 1 ? "s" : ""}</div>)}</div>}</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div><p className="text-sm uppercase tracking-widest text-slate-300">KCH Rx Scheduler</p><h1 className="mt-1 text-3xl font-bold">Schedule, PTO, Open Shifts, Daily Roles, and In-App Alerts</h1><p className="mt-2 max-w-3xl text-slate-300">Employees access this from their phone home screen. Alerts stay inside the app to keep the setup free.</p></div>
            <div className="grid grid-cols-4 gap-3 text-center"><div className="rounded-2xl bg-white/10 p-3"><div className="text-2xl font-bold">{pendingPto.length}</div><div className="text-xs text-slate-300">PTO</div></div><div className="rounded-2xl bg-white/10 p-3"><div className="text-2xl font-bold">{allOpenSpots.length}</div><div className="text-xs text-slate-300">Needs</div></div><div className="rounded-2xl bg-white/10 p-3"><div className="text-2xl font-bold">{pendingBids.length}</div><div className="text-xs text-slate-300">Bids</div></div><div className="rounded-2xl bg-white/10 p-3"><div className="text-2xl font-bold">{alerts.length}</div><div className="text-xs text-slate-300">Alerts</div></div></div>
          </div>
        </header>
        <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">{[["manager", UserCog, "Manager View"], ["employee", User, `Employee View (${unreadEmployeeAlerts.length})`], ["month", CalendarDays, "Month View"], ["settings", ClipboardList, "Setup / Rules"]].map(([key, Icon, label]) => <button key={key} onClick={() => setActiveTab(key)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${activeTab === key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}><Icon className="h-4 w-4" /> {label}</button>)}</div>

        {activeTab === "manager" && <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Section icon={CalendarDays} title="Schedule by location, job title, and daily role"><div className="overflow-auto rounded-2xl border border-slate-200"><table className="min-w-[920px] w-full border-collapse text-left text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="p-3 font-semibold">Day</th>{locations.map((location) => <th key={location} className="p-3 font-semibold">{location}</th>)}</tr></thead><tbody>{days.slice(0, 10).map((day) => <tr key={day.date} className="border-t border-slate-200 align-top"><td className="p-3 font-medium"><div>{day.date}</div>{day.tag && <div className="mt-2"><Badge tone={tagTone(day.tag)}>{day.tag}</Badge></div>}{isDateBlocked(day.date) && <div className="mt-2"><Badge tone="red"><Lock className="mr-1 h-3 w-3" /> PTO Blocked</Badge></div>}</td>{locations.map((location) => <td key={location} className="p-3">{renderScheduleCell(day, location)}</td>)}</tr>)}</tbody></table></div></Section><Section icon={Plane} title="PTO approval queue">{ptoRequests.map((request) => <div key={request.id} className="mb-3 rounded-2xl border border-slate-200 p-4"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{request.employee}</span><Badge>{getJobTitle(request.employee)}</Badge><Badge tone={statusTone(request.status)}>{request.status}</Badge></div><p className="mt-1 text-sm text-slate-600">{request.startDate} to {request.endDate} · {request.hours} PTO hours</p><p className="text-sm text-slate-500">Reason: {request.reason}</p></div>{request.status === "Pending" && <div className="grid grid-cols-2 gap-2"><Button onClick={() => updatePtoStatus(request.id, "Approved")} tone="green"><CheckCircle2 className="h-4 w-4" /> Approve</Button><Button onClick={() => updatePtoStatus(request.id, "Denied")} tone="red"><XCircle className="h-4 w-4" /> Deny</Button></div>}</div></div>)}</Section></div><div className="space-y-6"><Section icon={Briefcase} title="Assign daily role"><div className="space-y-3"><Field label="Day"><select value={roleDay} onChange={(e) => setRoleDay(e.target.value)} className={inputClass()}>{days.map((day) => <option key={day.date}>{day.date}</option>)}</select></Field><Field label="Location"><select value={roleLocation} onChange={(e) => { setRoleLocation(e.target.value); setRoleEmployee((schedule[roleDay]?.[e.target.value] || [""])[0] || ""); }} className={inputClass()}>{locations.map((location) => <option key={location}>{location}</option>)}</select></Field><Field label="Employee at that location"><select value={roleEmployee} onChange={(e) => setRoleEmployee(e.target.value)} className={inputClass()}>{employeesAtRoleLocation.map((name) => <option key={name}>{name}</option>)}</select></Field><Field label="Role / task"><select value={roleAssignment} onChange={(e) => setRoleAssignment(e.target.value)} className={inputClass()}>{specialRoles.map((role) => <option key={role}>{role}</option>)}</select></Field><Button onClick={applyDailyRole}><Briefcase className="h-4 w-4" /> Apply Role</Button></div></Section><Section icon={Building2} title="One-time coverage change"><div className="space-y-3"><Field label="Day"><select value={assignDay} onChange={(e) => setAssignDay(e.target.value)} className={inputClass()}>{days.map((day) => <option key={day.date}>{day.date}</option>)}</select></Field><Field label="Location"><select value={assignLocation} onChange={(e) => setAssignLocation(e.target.value)} className={inputClass()}>{locations.map((location) => <option key={location}>{location}</option>)}</select></Field><Field label="Employee"><select value={assignEmployee} onChange={(e) => setAssignEmployee(e.target.value)} className={inputClass()}>{eligibleForSelectedLocation.map((employee) => <option key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Reason"><input value={coverageReason} onChange={(e) => setCoverageReason(e.target.value)} className={inputClass()} /></Field><Button onClick={applyOneTimeCoverageChange}><Plus className="h-4 w-4" /> Apply Change</Button></div></Section><Section icon={Bell} title="All in-app alerts">{alerts.map((alert) => <div key={alert.id} className="mb-2 rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200"><div className="font-semibold">{alert.title} <Badge>{alert.type}</Badge></div><div className="text-slate-600">{alert.message}</div><div className="mt-1 text-xs text-slate-500">To: {alert.recipients.join(", ")}</div></div>)}</Section></div></div>}

        {activeTab === "employee" && <div className="grid gap-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2"><Section icon={Bell} title={`${employeeName}'s in-app alerts`}>{employeeAlerts.map((alert) => <div key={alert.id} className={`mb-3 rounded-2xl border p-4 ${alert.readBy.includes(employeeName) ? "border-slate-200 bg-white" : "border-sky-200 bg-sky-50"}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{alert.title}</span><Badge>{alert.type}</Badge>{!alert.readBy.includes(employeeName) && <Badge tone="blue">New</Badge>}</div><p className="mt-1 text-sm text-slate-600">{alert.message}</p></div><Button tone="light" onClick={() => markAlertRead(alert.id, employeeName)}>Mark read</Button></div></div>)}</Section><Section icon={Plane} title="Request PTO"><div className="grid gap-4 md:grid-cols-2"><Field label="Employee"><select value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className={inputClass()}>{employees.map((employee) => <option key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Available PTO"><div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm font-medium">{selectedEmployee.ptoBalance} hours</div></Field><Field label="Start date"><select value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass()}>{days.map((day) => <option disabled={isDateBlocked(day.date)} key={day.date}>{day.date}{isDateBlocked(day.date) ? " — PTO blocked" : ""}</option>)}</select></Field><Field label="End date"><select value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass()}>{days.map((day) => <option disabled={isDateBlocked(day.date)} key={day.date}>{day.date}{isDateBlocked(day.date) ? " — PTO blocked" : ""}</option>)}</select></Field><Field label="PTO hours"><input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass()} /></Field><Field label="Reason"><input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass()} /></Field></div><div className="mt-4"><Button disabled={selectedDatesBlocked} onClick={submitPtoRequest}><Plane className="h-4 w-4" /> Submit PTO</Button></div></Section><Section icon={Hand} title="Bid on open shifts"><div className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Employee"><select value={bidEmployee} onChange={(e) => setBidEmployee(e.target.value)} className={inputClass()}>{employees.map((employee) => <option key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Open shift"><select value={bidShiftKey} onChange={(e) => setBidShiftKey(e.target.value)} className={inputClass()}><option value="">Select an open shift</option>{allOpenSpots.filter((spot) => spot.jobTitle === selectedBidEmployee.jobTitle && selectedBidEmployee.eligibleLocations.includes(spot.location) && !isEmployeeUnavailable(selectedBidEmployee.name, spot.day)).map((spot) => <option key={`${spot.day}||${spot.location}||${spot.jobTitle}`} value={`${spot.day}||${spot.location}||${spot.jobTitle}`}>{spot.day} · {spot.location} · {spot.jobTitle}</option>)}</select></Field></div><Field label="Bid note"><input value={bidNote} onChange={(e) => setBidNote(e.target.value)} className={inputClass()} /></Field><Button onClick={submitShiftBid}><Hand className="h-4 w-4" /> Submit Bid</Button></div></Section></div><div className="space-y-6"><Section icon={User} title="My profile"><div className="rounded-2xl border border-slate-200 p-4"><div className="text-xl font-bold">{selectedEmployee.name}</div><div className="text-sm text-slate-500">{selectedEmployee.jobTitle}</div><div className="mt-3 text-sm"><strong>Home location:</strong> {selectedEmployee.homeLocation}</div><div className="mt-3"><Badge tone="green">In-app alerts only</Badge></div></div></Section><Section icon={AlertCircle} title="Mark myself unavailable"><div className="space-y-3"><Field label="Employee"><select value={unavailableEmployee} onChange={(e) => setUnavailableEmployee(e.target.value)} className={inputClass()}>{employees.map((employee) => <option key={employee.id}>{employee.name}</option>)}</select></Field><Field label="Unavailable date"><select value={unavailableDate} onChange={(e) => setUnavailableDate(e.target.value)} className={inputClass()}>{days.map((day) => <option key={day.date}>{day.date}</option>)}</select></Field><Field label="Reason"><input value={unavailableReason} onChange={(e) => setUnavailableReason(e.target.value)} className={inputClass()} /></Field><Button onClick={addUnavailableDay}>Mark Unavailable</Button></div></Section></div></div>}

        {activeTab === "month" && <div className="grid gap-6 lg:grid-cols-3"><div className="lg:col-span-2"><Section icon={CalendarDays} title="Month view"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{days.slice(0, 30).map((day) => { const openings = locations.flatMap((location) => getOpenSpots(day.date, location)); const specialRoleCount = Object.keys(dailyRoles).filter((key) => key.startsWith(`${day.date}||`)).length; return <div key={day.date} className={`rounded-2xl border p-3 ${isDateBlocked(day.date) ? "border-rose-200 bg-rose-50" : specialRoleCount ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{day.date}</div><div className="text-xs text-slate-500">{day.dayName}</div></div>{isDateBlocked(day.date) ? <Badge tone="red">PTO Blocked</Badge> : specialRoleCount ? <Badge tone="green">{specialRoleCount} special role{specialRoleCount > 1 ? "s" : ""}</Badge> : day.tag && <Badge tone={tagTone(day.tag)}>{day.tag}</Badge>}</div><div className="mt-3 space-y-2 text-xs">{locations.map((location) => <div key={location} className="rounded-xl bg-white/70 p-2"><div className="font-semibold">{location}</div><div className="text-slate-500">{(schedule[day.date]?.[location] || []).length} assigned</div></div>)}</div>{openings.length > 0 && <div className="mt-3 rounded-xl bg-amber-50 p-2 text-xs text-amber-800 ring-1 ring-amber-200">{openings.length} open coverage need{openings.length > 1 ? "s" : ""}</div>}</div>; })}</div></Section></div><div className="space-y-6"><Section icon={Download} title="Export schedule"><p className="mb-3 text-sm text-slate-600">Production version can export Excel/PDF.</p><Button><Download className="h-4 w-4" /> Export Schedule</Button></Section></div></div>}

        {activeTab === "settings" && <div className="grid gap-6 lg:grid-cols-2"><Section icon={Repeat} title="Weekly schedule template"><div className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><Field label="Day"><select value={templateDay} onChange={(e) => setTemplateDay(e.target.value)} className={inputClass()}>{weekdays.map((day) => <option key={day}>{day}</option>)}</select></Field><Field label="Location"><select value={templateLocation} onChange={(e) => setTemplateLocation(e.target.value)} className={inputClass()}>{locations.map((location) => <option key={location}>{location}</option>)}</select></Field><Field label="Employee"><select value={templateEmployee} onChange={(e) => setTemplateEmployee(e.target.value)} className={inputClass()}>{employees.filter((employee) => employee.eligibleLocations.includes(templateLocation)).map((employee) => <option key={employee.id}>{employee.name}</option>)}</select></Field></div><Button onClick={addEmployeeToTemplate}><Plus className="h-4 w-4" /> Add to Template</Button><Button onClick={generateYearFromTemplate}><Wand2 className="h-4 w-4" /> Generate Year From Template</Button></div></Section><Section icon={Briefcase} title="Staffing spots needed"><div className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><Field label="Location"><select value={needLocation} onChange={(e) => setNeedLocation(e.target.value)} className={inputClass()}>{locations.map((location) => <option key={location}>{location}</option>)}</select></Field><Field label="Job title"><select value={needJobTitle} onChange={(e) => setNeedJobTitle(e.target.value)} className={inputClass()}><option>Pharmacist</option><option>Technician</option></select></Field><Field label="Spots"><input type="number" value={needCount} onChange={(e) => setNeedCount(e.target.value)} className={inputClass()} /></Field></div><Button onClick={updateStaffingNeed}>Update Need</Button></div></Section></div>}
      </div>
    </div>
  );
}
