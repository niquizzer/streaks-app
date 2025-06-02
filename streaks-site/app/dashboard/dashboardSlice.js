"luse client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchGoals = createAsyncThunk("dashboard/fetchGoals", async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:8080/goals", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    console.error("Failed to fetch goals: ", error.message);
  }
  return response.json();
});

export const createGoal = createAsyncThunk(
  "dashboard/createGoal",
  async (goalData) => {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:8080/goals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(goalData),
    });
    return response.json();
  }
);

export const updateGoal = createAsyncThunk(
  "dashboard/updateGoal",
  async ({ id, goalData }) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:8080/goals/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(goalData),
    });
    return response.json();
  }
);

export const deleteGoal = createAsyncThunk(
  "dashboard/deleteGoal",
  async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8080/goals/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id;
  }
);

const initialState = {
  goals: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  userId: null,
  //store userID in state, clear userId on logout
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Create goal
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      })
      // Update goal
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(
          (goal) => goal.id === action.payload.id
        );
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      // Delete goal
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((goal) => goal.id !== action.payload);
      });
  },
});

// Selectors
export const selectAllGoals = (state) => state.dashboard.goals;
export const selectGoalById = (state, goalId) =>
  state.dashboard.goals.find((goal) => goal.id === goalId);
export const selectDashboardStatus = (state) => state.dashboard.status;
export const selectDashboardError = (state) => state.dashboard.error;

export default dashboardSlice.reducer;
