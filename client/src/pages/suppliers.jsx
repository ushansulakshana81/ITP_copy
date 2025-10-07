import {useQuery, useMutation} from "@tanstack/react-query";
import {useState} from "react";
import Header from "../components/layout/header.jsx";
import {Card, CardContent, CardHeader} from "../components/ui/card.jsx";
import {Button} from "../components/ui/button.jsx";
import {Input} from "../components/ui/input.jsx";
import {Label} from "../components/ui/label.jsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../components/ui/dialog.jsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../components/ui/form.jsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "../hooks/use-toast.js";
import {queryClient, apiRequest} from "../lib/queryClient.js";
import {Plus, Building2, Mail, Phone, MapPin, Edit, Trash2} from "lucide-react";
import {insertSupplierSchema} from "@shared/schema.js";
import EditSupplierModal from "../components/suppliers/edit-supplier-modal.jsx";

export default function Suppliers() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const {toast} = useToast();

    const {data: suppliers, isLoading} = useQuery({
        queryKey: ["/api/suppliers"],
    });

const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
};

const handleDelete = async (supplier) => {
    if (window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
        try {
            const response = await fetch(`/api/suppliers/${supplier._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete supplier');
            }

            // Refresh the suppliers list
            queryClient.invalidateQueries({queryKey: ["/api/suppliers"]});
            toast({
                title: "Success", 
                description: "Supplier deleted successfully"
            });
        } catch (error) {
            console.error('Error deleting supplier:', error);
            toast({
                title: "Error", 
                description: "Failed to delete supplier. Please try again.",
                variant: "destructive"
            });
        }
    }
};

    const form = useForm({
        resolver: zodResolver(insertSupplierSchema),
        defaultValues: {
            name: "",
            contactEmail: "",
            contactPhone: "",
            address: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await apiRequest("POST", "/api/suppliers", data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["/api/suppliers"]});
            setShowAddModal(false);
            form.reset();
            toast({title: "Success", description: "Supplier created successfully"});
        },
        onError: () => {
            toast({title: "Error", description: "Failed to create supplier", variant: "destructive"});
        },
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    return (
        <>
            <Header
                title="Suppliers"
                description="Manage your supplier information and contacts"
            />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">All Suppliers</h3>
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button data-testid="button-add-supplier">
                                <Plus className="w-4 h-4 mr-2"/>
                                Add Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Supplier</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Supplier Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter supplier name" {...field}
                                                           data-testid="input-supplier-name"/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contactEmail"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Contact Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        {...field}
                                                        value={field.value || ""}
                                                        data-testid="input-supplier-email"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contactPhone"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Contact Phone</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter phone number"
                                                        {...field}
                                                        value={field.value || ""}
                                                        data-testid="input-supplier-phone"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter address"
                                                        {...field}
                                                        value={field.value || ""}
                                                        data-testid="input-supplier-address"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAddModal(false)}
                                            data-testid="button-cancel-supplier"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            data-testid="button-save-supplier"
                                        >
                                            {createMutation.isPending ? "Adding..." : "Add Supplier"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-3 bg-slate-200 rounded"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : suppliers && suppliers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suppliers.map((supplier) => (
                            <Card key={supplier._id} className="hover:shadow-md transition-shadow"
                                  data-testid={`card-supplier-${supplier._id}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-blue-600"/>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-slate-900"
                                                    data-testid={`text-supplier-name-${supplier._id}`}>
                                                    {supplier.name}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button variant="ghost" size="sm"
                                            onClick={() => handleEdit(supplier)}
                                                    data-testid={`button-edit-supplier-${supplier._id}`}>
                                                <Edit className="w-4 h-4"/>
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                            onClick={() => handleDelete(supplier)}
                                                    data-testid={`button-delete-supplier-${supplier._id}`}>
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {supplier.contactEmail && (
                                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                <Mail className="w-4 h-4"/>
                                                <span
                                                    data-testid={`text-supplier-email-${supplier._id}`}>{supplier.contactEmail}</span>
                                            </div>
                                        )}
                                        {supplier.contactPhone && (
                                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                <Phone className="w-4 h-4"/>
                                                <span
                                                    data-testid={`text-supplier-phone-${supplier._id}`}>{supplier.contactPhone}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                <MapPin className="w-4 h-4"/>
                                                <span
                                                    data-testid={`text-supplier-address-${supplier._id}`}>{supplier.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300"/>
                            <h4 className="text-lg font-semibold text-slate-900 mb-2">No Suppliers Found</h4>
                            <p className="text-slate-600 mb-4">Get started by adding your first supplier</p>
                            <Button onClick={() => setShowAddModal(true)} data-testid="button-add-first-supplier">
                                <Plus className="w-4 h-4 mr-2"/>
                                Add Supplier
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
            <EditSupplierModal
    open={showEditModal}
    onOpenChange={setShowEditModal}
    supplier={selectedSupplier}
/>
        </>
    );
}