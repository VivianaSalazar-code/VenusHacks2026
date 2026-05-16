import { useState } from "react";
import { Plus, QrCode, Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
}

export function MealTracker() {
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: "1",
      name: "Oatmeal with Berries",
      calories: 350,
      protein: 12,
      carbs: 58,
      fats: 8,
      time: "8:30 AM",
    },
    {
      id: "2",
      name: "Grilled Chicken Salad",
      calories: 420,
      protein: 35,
      carbs: 28,
      fats: 15,
      time: "12:45 PM",
    },
  ]);

  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: "Hi! I'm your nutrition assistant. How can I help you with your diet today?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
  };

  const handleAddMeal = () => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: "New Meal",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setMeals([...meals, newMeal]);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages([
      ...chatMessages,
      { role: "user", text: chatInput },
      { role: "assistant", text: "That's a great question! Based on your current diet, I'd recommend..." },
    ]);
    setChatInput("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-['Montserrat'] font-bold text-[28px] text-[#172e54] mb-1">
          Meal Tracker
        </h1>
        <p className="font-['Montserrat'] font-semibold text-[14px] text-[#9e876e] tracking-[0.42px]">
          Track your meals for optimal heart health
        </p>
      </div>

      <Tabs defaultValue="today" className="mb-6">
        <TabsList className="bg-[#f3efe7] rounded-[30px] p-1.5">
          <TabsTrigger value="today" className="rounded-[20px] data-[state=active]:bg-white text-sm">
            Today
          </TabsTrigger>
          <TabsTrigger value="week" className="rounded-[20px] data-[state=active]:bg-white text-sm">
            This Week
          </TabsTrigger>
          <TabsTrigger value="month" className="rounded-[20px] data-[state=active]:bg-white text-sm">
            This Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          {/* Daily Calorie Range */}
          <Card className="bg-gradient-to-r from-[#f79891]/20 to-[#caebfe]/20 p-4 rounded-[20px] border-2 border-[#f79891] mb-4">
            <div className="text-center">
              <p className="font-['Poppins'] text-[11px] text-[#bd8e84] mb-1">Daily Calorie Range</p>
              <p className="font-['Montserrat'] font-bold text-[24px] text-[#172e54]">
                {totalCalories} <span className="text-[16px] text-[#9e876e]">/ 1800-2200 cal</span>
              </p>
              <p className="font-['Poppins'] text-[10px] text-[#172e54] mt-1">
                Recommended for heart-healthy pregnancy
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Today's Meals */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Montserrat'] font-bold text-[20px] text-[#172e54]">
                Today's Meals
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddMeal}
                  className="rounded-[30px] bg-[#f79891] hover:bg-[#f79891]/90 font-['Montserrat'] font-semibold text-sm px-4 py-2"
                >
                  <Plus size={16} className="mr-1.5" />
                  Add Meal
                </Button>
                <Button
                  variant="outline"
                  className="rounded-[30px] border-2 border-[#172e54] font-['Montserrat'] font-semibold text-sm px-4 py-2"
                >
                  <QrCode size={16} className="mr-1.5" />
                  Scan QR
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {meals.map((meal) => (
                <Card key={meal.id} className="bg-white p-4 rounded-[20px] border-2 border-[#f3efe7]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-['Montserrat'] font-semibold text-[16px] text-[#172e54] mb-0.5">
                        {meal.name}
                      </h4>
                      <p className="font-['Poppins'] text-[11px] text-[#bd8e84] mb-2">{meal.time}</p>
                      <div className="flex gap-4">
                        <div>
                          <p className="font-['Poppins'] text-[10px] text-[#9e876e]">Calories</p>
                          <p className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54]">
                            {meal.calories}
                          </p>
                        </div>
                        <div>
                          <p className="font-['Poppins'] text-[10px] text-[#9e876e]">Protein</p>
                          <p className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54]">
                            {meal.protein}g
                          </p>
                        </div>
                        <div>
                          <p className="font-['Poppins'] text-[10px] text-[#9e876e]">Carbs</p>
                          <p className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54]">
                            {meal.carbs}g
                          </p>
                        </div>
                        <div>
                          <p className="font-['Poppins'] text-[10px] text-[#9e876e]">Fats</p>
                          <p className="font-['Montserrat'] font-semibold text-[14px] text-[#172e54]">
                            {meal.fats}g
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Food Pyramid Charts */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#f3efe7] p-4 rounded-[20px] border-0">
              <h3 className="font-['Montserrat'] font-bold text-[14px] text-[#172e54] mb-2 text-center">
                Recommended
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Vegetables & Fruits", value: 35 },
                      { name: "Whole Grains", value: 30 },
                      { name: "Protein", value: 20 },
                      { name: "Dairy", value: 15 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#9BCF53" />
                    <Cell fill="#F4A460" />
                    <Cell fill="#E57373" />
                    <Cell fill="#64B5F6" />
                  </Pie>
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px' }}
                    formatter={(value) => <span className="font-['Poppins'] text-[10px]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-[#caebfe] p-4 rounded-[20px] border-0">
              <h3 className="font-['Montserrat'] font-bold text-[14px] text-[#172e54] mb-2 text-center">
                Your Intake Today
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Vegetables & Fruits", value: 26 },
                      { name: "Whole Grains", value: 18 },
                      { name: "Protein", value: 28 },
                      { name: "Dairy", value: 7 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#9BCF53" />
                    <Cell fill="#F4A460" />
                    <Cell fill="#E57373" />
                    <Cell fill="#64B5F6" />
                  </Pie>
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px' }}
                    formatter={(value) => <span className="font-['Poppins'] text-[10px]">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* AI Tips */}
          <Card className="bg-[#f3efe7] p-4 rounded-[20px] border-0">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-[#f79891]" size={18} />
              <h3 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54]">
                AI Tips
              </h3>
            </div>
            <div className="space-y-2">
              <div className="bg-white p-3 rounded-[15px]">
                <p className="font-['Poppins'] text-[11px] text-[#172e54]">
                  Great job on protein intake! Consider adding more leafy greens for heart health.
                </p>
              </div>
              <div className="bg-white p-3 rounded-[15px]">
                <p className="font-['Poppins'] text-[11px] text-[#172e54]">
                  You're close to your daily fiber goal. A serving of berries would be perfect!
                </p>
              </div>
              <div className="bg-white p-3 rounded-[15px]">
                <p className="font-['Poppins'] text-[11px] text-[#172e54]">
                  Remember to stay hydrated. Aim for 8 glasses of water today.
                </p>
              </div>
            </div>
          </Card>

          {/* Chat */}
          <Card className="bg-white p-4 rounded-[20px] border-2 border-[#f3efe7]">
            <h3 className="font-['Montserrat'] font-bold text-[16px] text-[#172e54] mb-3">
              Ask About Your Diet
            </h3>
            <div className="h-[350px] overflow-y-auto mb-3 space-y-2">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-[12px] ${
                    msg.role === "assistant"
                      ? "bg-[#f3efe7] text-[#172e54]"
                      : "bg-[#caebfe] text-[#172e54] ml-6"
                  }`}
                >
                  <p className="font-['Poppins'] text-[11px]">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask a question..."
                className="rounded-[15px] border-2 border-[#f3efe7] font-['Poppins'] text-sm"
              />
              <Button
                onClick={handleSendMessage}
                className="rounded-[15px] bg-[#172e54] hover:bg-[#172e54]/90 px-3"
              >
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
