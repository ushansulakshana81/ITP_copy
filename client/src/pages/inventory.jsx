import {useQuery} from "@tanstack/react-query";
import {useState} from "react";
import Header from "../components/layout/header.jsx";
import PartsTable from "../components/parts/parts-table.jsx";
import AddPartModal from "../components/parts/add-part-modal.jsx";
import EditPartModal from "../components/parts/edit-part-modal.jsx";
import {Button} from "../components/ui/button.jsx";
import {Plus} from "lucide-react";


export default function Inventory() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const {data: parts, isLoading} = useQuery({
        queryKey: ["/api/parts"],
    });

    const handleEdit = (part) => {
        setSelectedPart(part);
        setShowEditModal(true);
    };

    const handleDelete = async (part) => {
        if (window.confirm(`Are you sure you want to delete "${part.name}"?`)) {
            try {
                const response = await fetch(`/api/parts/${part._id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete part');
                }

                // Refresh the parts list
                window.location.reload();
            } catch (error) {
                console.error('Error deleting part:', error);
                alert('Failed to delete part. Please try again.');
            }
        }
    };

    return (
        <>
            <Header
                title="Inventory Management"
                description="Manage your spare parts inventory and stock levels"
            />

            <div className="p-6">
                <div className="flex items-center justify-end mb-6">
                    <Button
                        onClick={() => setShowAddModal(true)}
                        data-testid="button-add-part-inventory"
                    >
                        <Plus className="w-4 h-4 mr-2"/>
                        Add New Part
                    </Button>
                </div>

                <PartsTable
                    parts={parts || []}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <AddPartModal
                open={showAddModal}
                onOpenChange={setShowAddModal}
            />

            <EditPartModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                part={selectedPart}
            />
        </>
    );
}