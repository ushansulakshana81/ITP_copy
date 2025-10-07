// client/src/pages/categories.jsx
import {useQuery, useMutation} from "@tanstack/react-query";
import {useState} from "react";
import Header from "../components/layout/header.jsx";
import {Card, CardContent, CardHeader} from "../components/ui/card.jsx";
import {Button} from "../components/ui/button.jsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../components/ui/dialog.jsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../components/ui/form.jsx";
import {Input} from "../components/ui/input.jsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "../hooks/use-toast.js";
import {queryClient, apiRequest} from "../lib/queryClient.js";
import {Plus, Tag, Edit, Trash2} from "lucide-react";
import {insertCategorySchema} from "@shared/schema.js";
import EditCategoryModal from "../components/categories/edit-category-modal.jsx";

export default function Categories() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const {toast} = useToast();

    const {data: categories, isLoading} = useQuery({
        queryKey: ["/api/categories"],
    });

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const handleDelete = async (category) => {
        if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
            try {
                const response = await fetch(`/api/categories/${category._id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }

                // Refresh the categories list
                queryClient.invalidateQueries({queryKey: ["/api/categories"]});
                toast({
                    title: "Success", 
                    description: "Category deleted successfully"
                });
            } catch (error) {
                console.error('Error deleting category:', error);
                toast({
                    title: "Error", 
                    description: "Failed to delete category. Please try again.",
                    variant: "destructive"
                });
            }
        }
    };

    const form = useForm({
        resolver: zodResolver(insertCategorySchema),
        defaultValues: {
            name: "",
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await apiRequest("POST", "/api/categories", data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["/api/categories"]});
            setShowAddModal(false);
            form.reset();
            toast({title: "Success", description: "Category created successfully"});
        },
        onError: () => {
            toast({title: "Error", description: "Failed to create category", variant: "destructive"});
        },
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    return (
        <>
            <Header
                title="Categories"
                description="Manage your part categories and classifications"
            />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">All Categories</h3>
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button data-testid="button-add-category">
                                <Plus className="w-4 h-4 mr-2"/>
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Category Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Enter category name"
                                                        data-testid="input-category-name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={createMutation.isPending}
                                            data-testid="button-save-category"
                                        >
                                            {createMutation.isPending ? "Adding..." : "Add Category"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                                    <div className="h-3 bg-slate-200 rounded mb-2"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : categories && categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <Card key={category._id} className="hover:shadow-md transition-shadow"
                                  data-testid={`card-category-${category._id}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Tag className="w-5 h-5 text-green-600"/>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-slate-900"
                                                    data-testid={`text-category-name-${category._id}`}>
                                                    {category.name}
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                                data-testid={`button-edit-category-${category._id}`}
                                            >
                                                <Edit className="w-4 h-4"/>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => handleDelete(category)}
                                                data-testid={`button-delete-category-${category._id}`}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500"/>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Tag className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
                            <h3 className="text-lg font-medium text-slate-900 mb-2">No categories yet</h3>
                            <p className="text-slate-600 mb-4">
                                Get started by adding your first category.
                            </p>
                            <Button onClick={() => setShowAddModal(true)}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Add Category
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <EditCategoryModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                category={selectedCategory}
            />
        </>
    );
}