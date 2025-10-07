import {createServer} from "http";
import {storage} from "./storage.js";
import {insertPartSchema, insertSupplierSchema, insertCategorySchema, insertMovementSchema} from "../shared/schema.js";
import {z} from "zod";
import { User } from "./models/User.js";
import bcrypt from "bcrypt";
import Role from "./models/Role.js";
import { verifyToken } from "./middleware/authMiddleware.js";

export async function registerRoutes(app) {

    // Parts routes
    app.get("/api/parts", async (req, res) => {
        try {
            const {search} = req.query;
            let parts;

            if (search && typeof search === 'string') {
                parts = await storage.searchParts(search);
            } else {
                parts = await storage.getParts();
            }

            res.json(parts);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch parts"});
        }
    });

    app.get("/api/users/:id", verifyToken, async (req, res) => {
        try {
          const user = await User.findById(req.params.id);
          if (!user) return res.status(404).json({ message: "User not found" });
          res.json(user);
        } catch (error) {
          res.status(500).json({ message: "Failed to fetch user" });
        }
      });

  app.get('/api/parts/low-stock', async (req, res) => {
    const parts = await storage.getParts();
    const lowStockParts = parts.filter(part => 
        part.quantity <= part.minimumStock
    );
    res.json(lowStockParts);
});

    app.get("/api/parts/:id", async (req, res) => {
        try {
            const part = await storage.getPart(req.params.id);
            if (!part) {
                return res.status(404).json({message: "Part not found"});
            }
            res.json(part);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch part"});
        }
    });

    app.post("/api/parts", async (req, res) => {
        try {
            const validatedData = insertPartSchema.parse(req.body);
            const part = await storage.createPart(validatedData);
            res.status(201).json(part);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({message: "Invalid data", errors: error.errors});
            }
            res.status(500).json({message: "Failed to create part"});
        }
    });

    app.put("/api/parts/:id", async (req, res) => {
        try {
            const validatedData = insertPartSchema.partial().parse(req.body);
            const part = await storage.updatePart(req.params.id, validatedData);
            res.json(part);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({message: "Invalid data", errors: error.errors});
            }
            res.status(500).json({message: "Failed to update part"});
        }
    });

    app.delete("/api/parts/:id", async (req, res) => {
        try {
            const success = await storage.deletePart(req.params.id);
            if (!success) {
                return res.status(404).json({message: "Part not found"});
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({message: "Failed to delete part"});
        }
    });

    // Suppliers routes
    app.get("/api/suppliers", async (req, res) => {
        try {
            const suppliers = await storage.getSuppliers();
            res.json(suppliers);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch suppliers"});
        }
    });

    app.post("/api/suppliers", async (req, res) => {
        try {
            const validatedData = insertSupplierSchema.parse(req.body);
            const supplier = await storage.createSupplier(validatedData);
            res.status(201).json(supplier);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({message: "Invalid data", errors: error.errors});
            }
            res.status(500).json({message: "Failed to create supplier"});
        }
    });
    app.put("/api/suppliers/:id", async (req, res) => {
    try {
        const validatedData = insertSupplierSchema.partial().parse(req.body);
        const supplier = await storage.updateSupplier(req.params.id, validatedData);
        res.json(supplier);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: "Invalid data", errors: error.errors});
        }
        if (error.message === "Supplier not found") {
            return res.status(404).json({message: "Supplier not found"});
        }
        res.status(500).json({message: "Failed to update supplier"});
    }
});

app.delete("/api/suppliers/:id", async (req, res) => {
    try {
        const success = await storage.deleteSupplier(req.params.id);
        if (!success) {
            return res.status(404).json({message: "Supplier not found"});
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({message: "Failed to delete supplier"});
    }
});

    // Categories routes
    app.get("/api/categories", async (req, res) => {
        try {
            const categories = await storage.getCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch categories"});
        }
    });

    app.post("/api/categories", async (req, res) => {
        try {
            const validatedData = insertCategorySchema.parse(req.body);
            const category = await storage.createCategory(validatedData);
            res.status(201).json(category);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({message: "Invalid data", errors: error.errors});
            }
            res.status(500).json({message: "Failed to create category"});
        }
    });
    app.put("/api/categories/:id", async (req, res) => {
        try {
            const validatedData = insertCategorySchema.partial().parse(req.body);
            const category = await storage.updateCategory(req.params.id, validatedData);
            res.json(category);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({message: "Invalid data", errors: error.errors});
            }
            if (error.message === "Category not found") {
                return res.status(404).json({message: "Category not found"});
            }
            res.status(500).json({message: "Failed to update category"});
        }
    });

    app.delete("/api/categories/:id", async (req, res) => {
        try {
            const success = await storage.deleteCategory(req.params.id);
            if (!success) {
                return res.status(404).json({message: "Category not found"});
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({message: "Failed to delete category"});
        }
    });

    // Movements routes
    app.get("/api/movements", async (req, res) => {
        try {
            const movements = await storage.getMovements();
            res.json(movements);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch movements"});
        }
    });

    app.get("/api/movements/part/:partId", async (req, res) => {
        try {
            const movements = await storage.getMovementsByPart(req.params.partId);
            res.json(movements);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch part movements"});
        }
    });

    app.post("/api/movements", async (req, res) => {
        try {
            const validatedData = insertMovementSchema.parse(req.body);
            const movement = await storage.createMovement(validatedData);
            res.status(201).json(movement);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({message: "Invalid data", errors: error.errors});
            }
            res.status(500).json({message: "Failed to create movement"});
        }
    });

    // Stats route
    app.get("/api/stats", async (req, res) => {
        try {
            const stats = await storage.getInventoryStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({message: "Failed to fetch stats"});
        }
    });

    // Reports routes
    app.get("/api/reports", async (req, res) => {
        try {
            const reports = await storage.getReports();
            res.json(reports);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch reports"});
        }
    });

    app.post("/api/reports", async (req, res) => {
        try {
            const report = await storage.createReport(req.body);
            res.status(201).json(report);
        } catch (error) {
            res.status(500).json({error: "Failed to create report"});
        }
    });

  // Users routes
  app.get("/api/users", verifyToken, async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: "User not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "User not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Login route with JWT (30m expiry + inactivity tracking)
  app.post("/api/login", async (req, res) => {
    try {
      console.log("Incoming login body:", req.body);

      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email or password missing", receivedBody: req.body });
      }

      const user = await User.findOne({ email });
      console.log("Found user:", user);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.password) {
        return res.status(400).json({ message: "User has no stored password", user });
      }

      console.log("Comparing passwords...");
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Import JWT dynamically
      const jwt = await import("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

      // Token expires in 30 minutes
      const token = jwt.default.sign(
        { id: user._id, lastActivity: Date.now() },
        JWT_SECRET,
        { expiresIn: "30m" }
      );

      res.json({
        message: "Login successful",
        token,
        userId: user._id,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          employeeNumber: user.employeeNumber,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  // ✅ Create user with auto employee number + role validation
  app.post("/api/create-user", async (req, res) => {
    try {
      console.log("Incoming data:", req.body);
      const { firstName, lastName, email, homeTown, mobile, nic, designation, roleID, password } = req.body;

      // Lookup role by roleID
      const role = await Role.findOne({ roleID });
      if (!role) {
        return res.status(400).json({ error: "Invalid roleID" });
      }

      // Generate username by concatenating firstName and lastName
      const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      const username =
        capitalize(firstName) +
        (lastName.length > 0 ? capitalize(lastName.slice(0, 2)) : "");

      // Generate employee number using count
      const count = await User.countDocuments();
      const employeeNumber = "HS" + String(count + 1).padStart(4, "0");
      console.log("Generated employee number:", employeeNumber);

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        firstName,
        lastName,
        email,
        homeTown,
        mobile,
        nic,
        designation,
        role: role.roleName,
        username,
        status: "active",
        createdDate: Date.now(),
        password: hashedPassword,
        employeeNumber,
      });

      await newUser.save();
      console.log("Saved user with employee number:", newUser.employeeNumber);

      const userResponse = newUser.toObject();
      delete userResponse.password;

      res.json({ message: "✅ User created successfully", user: userResponse });
    } catch (err) {
      console.error("Error in /api/create-user:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 🔹 Get all roles
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await Role.find().select("roleID roleName -_id");
      res.json(roles);
    } catch (err) {
      console.error("Error fetching roles:", err);
      res.status(500).json({ error: "Server error fetching roles" });
    }
  });

  // 🔹 Get user by employee number
  app.get("/api/users/employee/:employeeNumber", async (req, res) => {
    try {
      const user = await User.findOne({ employeeNumber: req.params.employeeNumber });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      console.error("Error fetching user by employee number:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // 🔹 Terminate user (set status inactive)
  app.patch("/api/users/:id/terminate", async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { status: "inactive" },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ message: "User terminated successfully", user });
    } catch (err) {
      console.error("Error terminating user:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
    const httpServer = createServer(app);
    return httpServer;
}