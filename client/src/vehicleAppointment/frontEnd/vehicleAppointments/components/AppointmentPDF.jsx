import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const AppointmentPDF = ({ appointments }) => {

    const exportPDF = () => {
        const doc = new jsPDF();

        // Header 
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Company Name", 105, 15, { align: "center" });
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("123 Main Street, Malabe, Sri Lanka", 105, 22, { align: "center" });
        doc.text("Phone: +1234567890 | Email: info@abc.com", 105, 28, { align: "center" });

        // Title 
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Appointment Report", 105, 40, { align: "center" });

        //  Table 
        const columns = ["Vehicle", "License Plate", "Service Types", "Date", "Time", "Status"];
        const rows = appointments.map((a) => [
            `${a.vehicleMake} ${a.vehicleModel}`,
            a.licensePlate,
            a.serviceTypes.join(", "),
            new Date(a.date).toLocaleDateString(),
            a.timeSlot,
            a.status,
        ]);

        autoTable(doc, {
            startY: 50,
            head: [columns],
            body: rows,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [52, 58, 64] },
        });

        // Signs
        const finalY = doc.lastAutoTable.finalY || 50;
        doc.setFontSize(12);
        doc.text("Prepared by:", 20, finalY + 30);
        doc.line(40, finalY + 32, 100, finalY + 32); // 1 signature

        doc.text("Approved by:", 140, finalY + 30);
        doc.line(160, finalY + 32, 200, finalY + 32); // 2 signature

        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
        doc.save(`appointments_report_${formattedDate}.pdf`);
    };

    return (
        <button className="btn btn-primary w-100" onClick={exportPDF}>
            <i className="fas fa-file-pdf me-2"></i>Export PDF
        </button>
    );
};

export default AppointmentPDF;
