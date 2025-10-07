import {useMutation, useQuery} from "@tanstack/react-query";
import {useEffect} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "../ui/dialog.jsx";
import {Button} from "../ui/button.jsx";
import {Input} from "../ui/input.jsx";
import {Textarea} from "../ui/textarea.jsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.jsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.jsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "@/hooks/use-toast.js";
import {queryClient, apiRequest} from "@/lib/queryClient.js";
import {insertPartSchema} from "@shared/schema.js";


export default function EditPartModal({open, onOpenChange, part}) {
    const {toast} = useToast();

    const {data: categories, isLoading: categoriesLoading, error: categoriesError} = useQuery({
        queryKey: ["/api/categories"],
    });

    const {data: suppliers, isLoading: suppliersLoading, error: suppliersError} = useQuery({
        queryKey: ["/api/suppliers"],
    });

    const form = useForm({
        resolver: zodResolver(insertPartSchema),
        defaultValues: {
            name: "",
            partNumber: "",
            description: null,
            categoryId: undefined,
            supplierId: undefined,
            quantity: 0,
            minimumStock: 0,
            unitPrice: 0,
            location: null,
        },
    });

    // Update form when part changes
    useEffect(() => {
        if (part && open) {
            form.reset({
                name: part.name,
                partNumber: part.partNumber,
                description: part.description || "",
                categoryId: part.categoryId || "",
                supplierId: part.supplierId || "",
                quantity: part.quantity,
                minimumStock: part.minimumStock,
                unitPrice: part.unitPrice,
                location: part.location || "",
            });
        }
    }, [part, open, form]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            if (!part?._id) throw new Error("No part ID");
            const response = await apiRequest("PUT", `/api/parts/${part._id}`, data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["/api/parts"]});
            queryClient.invalidateQueries({queryKey: ["/api/stats"]});
            onOpenChange(false);
            toast({title: "Success", description: "Part updated successfully"});
        },
        onError: () => {
            toast({title: "Error", description: "Failed to update part", variant: "destructive"});
        },
    });

    const onSubmit = (data) => {
        updateMutation.mutate(data);
    };

    if (!part) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Part</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Part Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter part name" {...field}
                                                   data-testid="input-edit-part-name"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="partNumber"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Part Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter part number" {...field}
                                                   data-testid="input-edit-part-number"/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                            <FormControl>
                                                <SelectTrigger data-testid="select-edit-category">
                                                    <SelectValue placeholder="Select category"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>{categoriesLoading ? (
                                                <div>Loading categories...</div>
                                            ) : categoriesError ? (
                                                <div>Error loading categories</div>
                                            ) : categories?.length ? (
                                                categories?.map((category) => (
                                                    <SelectItem key={category._id} value={category._id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))) : (<div> no categories available</div>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Supplier</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                                            <FormControl>
                                                <SelectTrigger data-testid="select-edit-supplier">
                                                    <SelectValue placeholder="Select supplier"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliersLoading ? (
                                                    <div>Loading suppliers...</div>
                                                ) : suppliersError ? (
                                                    <div>Error loading suppliers</div>
                                                ) : suppliers?.length ? (
                                                    suppliers?.map((supplier) => (
                                                        <SelectItem key={supplier._id} value={supplier._id}>
                                                            {supplier.name}
                                                        </SelectItem>
                                                    ))) : (<div>no suppliers available</div>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Current Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                data-testid="input-edit-quantity"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="minimumStock"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Minimum Stock Level</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                data-testid="input-edit-minimum-stock"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitPrice"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Unit Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                data-testid="input-edit-unit-price"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Storage Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., A1-B2-C3"
                                                {...field}
                                                value={field.value || ""}
                                                data-testid="input-edit-location"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter part description"
                                            className="min-h-[100px]"
                                            {...field}
                                            value={field.value || ""}
                                            data-testid="input-edit-description"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                data-testid="button-cancel-edit-part"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                data-testid="button-update-part"
                            >
                                {updateMutation.isPending ? "Updating..." : "Update Part"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
