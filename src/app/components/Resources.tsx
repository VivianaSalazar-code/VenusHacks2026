// src/app/components/Resources.tsx
import { useState, useEffect } from "react";
import { Search, MapPin, Phone, Clock, AlertCircle, Heart, Users, GraduationCap, ExternalLink, BookOpen, Video, FileText, Activity, Droplet, Apple } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// Types matching backend schemas
type LifeStage = "teen" | "adult" | "expecting" | "postpartum" | "menopause";
type DashBucket = "vegetables" | "fruits" | "whole_grains" | "lean_protein" | "low_fat_dairy" | "nuts_seeds_legumes" | "fats_sweets";

interface UserProfile {
  user_name: string;
  age: number;
  ethnicity: string;
  user_location: string;
}

interface LifeStageState {
  life_stage: LifeStage;
  weeks_postpartum: number;
  maternity_desert_zone: boolean;
}

interface Biometrics {
  sys_bp: number;
  dia_bp: number;
  current_hr: number;
  current_hrv: number;
  active_symptoms: string[];
}

interface DailyNutrition {
  daily_sodium_mg: number;
  daily_cholesterol_mg: number;
  daily_potassium_mg: number;
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
  daily_fiber_g: number;
  target_diet_type: string;
}

interface FullState {
  user_profile: UserProfile;
  life_stage_state: LifeStageState;
  biometrics: Biometrics;
  daily_nutrition: DailyNutrition;
}

interface Clinic {
  name: string;
  address: string;
  phone: string;
  distance: string;
  services: string[];
  language: string[];
  website?: string;
  google_maps_url?: string;
}

interface SupportGroup {
  name: string;
  type: string;
  schedule: string;
  location: string;
  contact: string;
  website?: string;
  distance?: number;
}

interface BPScreeningLocation {
  name: string;
  address: string;
  hours: string;
  cost: string;
  website?: string;
}

interface ResourceLink {
  title: string;
  description: string;
  url: string;
  category: "article" | "video" | "guide" | "external";
  language?: string;
}

interface PersonalizedResourcesResponse {
  clinics: Clinic[];
  support_groups: SupportGroup[];
  bp_screening: BPScreeningLocation[];
  resource_links: ResourceLink[];
  health_alert: {
    title: string;
    message: string;
    severity: string;
    action_required: boolean;
  } | null;
  personalized_recommendations: string[];
}

// API service
const apiService = {
  async getPersonalizedResources(state: FullState): Promise<PersonalizedResourcesResponse> {
    const response = await fetch('/api/resources/personalized', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }

    return response.json();
  },

  async getUserState(): Promise<FullState | null> {
    const savedState = localStorage.getItem('userFullState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return null;
  },

  async saveUserState(state: FullState): Promise<void> {
    localStorage.setItem('userFullState', JSON.stringify(state));
  }
};

// Main Resources Component
export function Resources() {
  const [userState, setUserState] = useState<FullState | null>(null);
  const [resources, setResources] = useState<PersonalizedResourcesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHealthAlert, setShowHealthAlert] = useState(true);
  const [activeTab, setActiveTab] = useState("clinics");

  // Load user state and fetch personalized resources
  useEffect(() => {
    const loadResources = async () => {
      try {
        // Get user state from localStorage (set during onboarding)
        let state = await apiService.getUserState();

        // If no state exists, create a demo state (for testing)
        if (!state) {
          state = {
            user_profile: {
              user_name: "Maria",
              age: 32,
              ethnicity: "hispanic",
              user_location: "Costa Mesa, CA 92627",
            },
            life_stage_state: {
              life_stage: "postpartum",
              weeks_postpartum: 3,
              maternity_desert_zone: false,
            },
            biometrics: {
              sys_bp: 128,
              dia_bp: 85,
              current_hr: 78,
              current_hrv: 42,
              active_symptoms: ["fatigue", "shortness_breath"],
            },
            daily_nutrition: {
              daily_sodium_mg: 2300,
              daily_cholesterol_mg: 180,
              daily_potassium_mg: 2500,
              daily_calories: 1850,
              daily_protein_g: 65,
              daily_carbs_g: 200,
              daily_fat_g: 55,
              daily_fiber_g: 25,
              target_diet_type: "DASH",
            },
          };
          await apiService.saveUserState(state);
        }

        setUserState(state);

        // Fetch personalized resources based on user state
        const personalizedResources = await apiService.getPersonalizedResources(state);
        setResources(personalizedResources);
      } catch (error) {
        console.error("Error loading resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "article":
        return <FileText size={18} />;
      case "video":
        return <Video size={18} />;
      case "guide":
        return <BookOpen size={18} />;
      default:
        return <ExternalLink size={18} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "article":
        return "bg-blue-100 text-blue-700";
      case "video":
        return "bg-purple-100 text-purple-700";
      case "guide":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f79891] mx-auto mb-4"></div>
          <p className="font-['Poppins'] text-[#9e876e]">Personalizing your resources...</p>
        </div>
      </div>
    );
  }

  if (!resources || !userState) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Unable to load resources</AlertTitle>
          <AlertDescription>Please check your connection and try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Health Alert from Backend */}
      {showHealthAlert && resources.health_alert && (
        <Alert className={`mb-6 border-2 ${resources.health_alert.severity === 'critical'
            ? 'border-red-500 bg-red-50'
            : 'border-yellow-500 bg-yellow-50'
          }`}>
          <AlertCircle className={`h-5 w-5 ${resources.health_alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`} />
          <AlertTitle className="font-['Montserrat'] font-bold text-lg">
            {resources.health_alert.title}
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">{resources.health_alert.message}</p>
            {resources.health_alert.action_required && (
              <div className="flex gap-3">
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => openExternalLink("https://www.google.com/maps/search/emergency+room+near+me")}
                >
                  Find Emergency Care
                </Button>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600"
                  onClick={() => window.location.href = "tel:911"}
                >
                  Call 911
                </Button>
                <Button variant="ghost" onClick={() => setShowHealthAlert(false)}>
                  Dismiss
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Personalized Header */}
      <div className="mb-6">
        <h1 className="font-['Montserrat'] font-bold text-3xl text-[#172e54] mb-2">
          Resources for {userState.user_profile.user_name}
        </h1>
        <p className="font-['Poppins'] text-base text-[#9e876e]">
          Personalized based on your {userState.life_stage_state.life_stage} stage and health profile
        </p>
      </div>

      {/* Personalized Recommendations */}
      {resources.personalized_recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-[#caebfe] to-[#f3efe7] p-5 rounded-2xl mb-6">
          <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-3">
            💡 Personalized Recommendations
          </h3>
          <ul className="space-y-2">
            {resources.personalized_recommendations.map((rec, idx) => (
              <li key={idx} className="font-['Poppins'] text-sm text-[#172e54] flex items-start gap-2">
                <span className="text-[#f79891]">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Location Info */}
      <Card className="bg-white p-5 rounded-3xl border-2 border-[#f3efe7] mb-6">
        <div className="flex items-center gap-2 text-[#172e54]">
          <MapPin size={20} className="text-[#f79891]" />
          <span className="font-['Poppins'] text-sm">
            Showing resources near: <strong>{userState.user_profile.user_location}</strong>
          </span>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-[#f3efe7] rounded-3xl p-1.5">
          <TabsTrigger value="clinics" className="rounded-2xl data-[state=active]:bg-white text-sm">
            Nearby Clinics
          </TabsTrigger>
          <TabsTrigger value="support" className="rounded-2xl data-[state=active]:bg-white text-sm">
            Support Groups
          </TabsTrigger>
          <TabsTrigger value="screening" className="rounded-2xl data-[state=active]:bg-white text-sm">
            BP Screening
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-2xl data-[state=active]:bg-white text-sm">
            Resources & Links
          </TabsTrigger>
        </TabsList>

        {/* Nearby Clinics */}
        <TabsContent value="clinics" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Clinics Near You
          </h2>

          {resources.clinics.map((clinic, idx) => (
            <Card key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7] hover:border-[#bd8e84] transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-['Montserrat'] font-semibold text-lg text-[#172e54] mb-2">
                    {clinic.name}
                  </h3>
                  <div className="space-y-1.5 mb-3">
                    <p className="font-['Poppins'] text-sm text-[#bd8e84] flex items-center gap-2">
                      <MapPin size={16} />
                      {clinic.address} <span className="text-[#9e876e]">({clinic.distance})</span>
                    </p>
                    <p className="font-['Poppins'] text-sm text-[#bd8e84] flex items-center gap-2">
                      <Phone size={16} />
                      {clinic.phone}
                    </p>
                  </div>
                  <div className="mb-2">
                    <p className="font-['Poppins'] text-xs text-[#9e876e] mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {clinic.services.map((service, i) => (
                        <span key={i} className="px-2.5 py-1 bg-[#caebfe] rounded-full font-['Poppins'] text-xs text-[#172e54]">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  className="rounded-2xl bg-[#172e54] hover:bg-[#172e54]/90 text-sm"
                  onClick={() => openExternalLink(clinic.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(clinic.address)}`)}
                >
                  Get Directions
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Support Groups */}
        <TabsContent value="support" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Support Groups
          </h2>

          {resources.support_groups.map((group, idx) => (
            <Card key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7]">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#f3efe7] rounded-full">
                  <Users className="text-[#172e54]" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Montserrat'] font-semibold text-lg text-[#172e54] mb-1">
                    {group.name}
                  </h3>
                  <p className="font-['Poppins'] text-sm text-[#bd8e84] mb-2">{group.type}</p>
                  <div className="space-y-1">
                    <p className="font-['Poppins'] text-sm text-[#172e54] flex items-center gap-2">
                      <Clock size={16} />
                      {group.schedule}
                    </p>
                    <p className="font-['Poppins'] text-sm text-[#172e54] flex items-center gap-2">
                      <MapPin size={16} />
                      {group.location}
                      {group.distance && (
                        <span className="text-[#9e876e] text-xs">({group.distance.toFixed(1)} miles)</span>
                      )}
                    </p>
                    <p className="font-['Poppins'] text-sm text-[#172e54] flex items-center gap-2">
                      <Phone size={16} />
                      {group.contact}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="rounded-2xl border-2 border-[#172e54] text-sm"
                  onClick={() => openExternalLink(group.website || "#")}
                >
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* BP Screening */}
        <TabsContent value="screening" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Free & Affordable Blood Pressure Screening
          </h2>

          {resources.bp_screening.map((location, idx) => (
            <Card key={idx} className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-['Montserrat'] font-semibold text-lg text-[#172e54] mb-2">
                    {location.name}
                  </h3>
                  <div className="space-y-1.5">
                    <p className="font-['Poppins'] text-sm text-[#bd8e84] flex items-center gap-2">
                      <MapPin size={16} />
                      {location.address}
                    </p>
                    <p className="font-['Poppins'] text-sm text-[#bd8e84] flex items-center gap-2">
                      <Clock size={16} />
                      {location.hours}
                    </p>
                    <p className="font-['Poppins'] text-sm text-green-600 font-semibold">
                      {location.cost}
                    </p>
                  </div>
                </div>
                <Button
                  className="rounded-2xl bg-[#f79891] hover:bg-[#f79891]/90 text-sm"
                  onClick={() => openExternalLink(location.website || "https://www.heart.org")}
                >
                  Learn More
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Resources & Links */}
        <TabsContent value="resources" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Trusted Resources & Educational Links
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.resource_links.map((resource, idx) => (
              <Card
                key={idx}
                className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7] hover:border-[#bd8e84] hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => openExternalLink(resource.url)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`p-1.5 rounded-lg ${getCategoryColor(resource.category)}`}>
                        {getCategoryIcon(resource.category)}
                      </span>
                      <span className="font-['Poppins'] text-xs font-semibold uppercase tracking-wide text-[#9e876e]">
                        {resource.category}
                      </span>
                      {resource.language && (
                        <span className="px-2 py-0.5 bg-[#f3efe7] rounded-full font-['Poppins'] text-xs text-[#172e54]">
                          {resource.language}
                        </span>
                      )}
                    </div>
                    <h3 className="font-['Montserrat'] font-semibold text-base text-[#172e54] mb-1">
                      {resource.title}
                    </h3>
                    <p className="font-['Poppins'] text-sm text-[#9e876e] mb-3">
                      {resource.description}
                    </p>
                    <div className="inline-flex items-center gap-2 font-['Poppins'] text-sm text-[#f79891] group-hover:gap-3 transition-all">
                      View Resource
                      <ExternalLink size={14} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}