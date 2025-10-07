
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form.jsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast.js";
import { queryClient, apiRequest } from "../../lib/queryClient.js";
import { insertCategorySchema } from "@shared/schema.js";

export default function EditCategoryModal({ open, onOpenChange, category }) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || "",
      });
    }
  }, [category, form]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PUT", `/api/categories/${category._id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      onOpenChange(false);
      toast({ 
        title: "Success", 
        description: "Category updated successfully" 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update category", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name"
                      data-testid="input-edit-category-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-update-category"
              >
                {updateMutation.isPending ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}