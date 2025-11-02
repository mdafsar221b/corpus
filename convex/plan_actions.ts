
"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Id } from "./_generated/dataModel"; // ⬅️ ADD THIS IMPORT

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper functions (Moved from http.ts to centralize data processing)
function validateWorkoutPlan(plan: any) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise: any) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine: any) => ({
        name: routine.name,
        sets: typeof routine.sets === "number" ? routine.sets : parseInt(routine.sets) || 1,
        reps: typeof routine.reps === "number" ? routine.reps : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

function validateDietPlan(plan: any) {
  const validatedPlan = {
    dailyCalories: plan.dailyCalories,
    meals: plan.meals.map((meal: any) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

// 🚨 FIX 1: Explicitly define the return type as Promise<Id<"plans">>
export const generatePlanAction = action({
  args: {
    userId: v.string(),
    age: v.number(),
    height: v.string(),
    weight: v.string(),
    injuries: v.string(),
    workout_days: v.number(),
    fitness_goal: v.string(),
    fitness_level: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"plans">> => { // ⬅️ Type Annotation Added
    const { userId, age, height, weight, injuries, workout_days, fitness_goal, fitness_level } = args;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        responseMimeType: "application/json",
      },
    });

    // --- WORKOUT PLAN GENERATION ---
    const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      Injuries or limitations: ${injuries}
      Available days for workout: ${workout_days}
      Fitness goal: ${fitness_goal}
      Fitness level: ${fitness_level}
      
      As a professional coach:
      - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
      - Design exercises that match the fitness level and account for any injuries
      - Structure the workouts to specifically target the user's fitness goal
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
      - For example: "sets": 3, "reps": 10
      - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
      - Instead use specific numbers like "reps": 12 or "reps": 15
      - For cardio, use "sets": 1, "reps": 1 or another appropriate number
      - NEVER include strings for numerical fields
      - NEVER add extra fields not shown in the example below
      
      Return a JSON object with this EXACT structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10
              }
            ]
          }
        ]
      }
      
      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

    const workoutResult = await model.generateContent(workoutPrompt);
    const workoutPlanText = workoutResult.response.text();
    let workoutPlan = validateWorkoutPlan(JSON.parse(workoutPlanText));

    // --- DIET PLAN GENERATION ---
    const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${injuries} 
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

    const dietResult = await model.generateContent(dietPrompt);
    const dietPlanText = dietResult.response.text();
    let dietPlan = validateDietPlan(JSON.parse(dietPlanText));


    // 🚨 FIX 2: Explicitly annotate the type of planId
    const planId: Id<"plans"> = await ctx.runMutation(api.plans.createPlan, {
      userId: userId,
      dietPlan,
      isActive: true,
      workoutPlan,
      name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
    });
    
    return planId;
  },
});