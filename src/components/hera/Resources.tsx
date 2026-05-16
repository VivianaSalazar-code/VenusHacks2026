import { useState } from "react";
import { Search, MapPin, Phone, Clock, AlertCircle, Heart, Users, GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Clinic {
  name: string;
  address: string;
  phone: string;
  distance: string;
  services: string[];
  language: string[];
}

interface SupportGroup {
  name: string;
  type: string;
  schedule: string;
  location: string;
  contact: string;
}

export function Resources() {
  const [location, setLocation] = useState("");
  const [showHealthAlert, setShowHealthAlert] = useState(true);

  const clinics: Clinic[] = [
    {
      name: "Community Health Center of Orange County",
      address: "1835 Newport Blvd, Costa Mesa, CA 92627",
      phone: "(714) 972-3000",
      distance: "2.3 miles",
      services: ["Prenatal Care", "Postpartum Care", "Blood Pressure Screening", "Cardiovascular Health"],
      language: ["English", "Spanish", "Vietnamese"],
    },
    {
      name: "St. Joseph Hospital Women's Health Center",
      address: "1100 W Stewart Dr, Orange, CA 92868",
      phone: "(714) 734-6220",
      distance: "4.1 miles",
      services: ["Maternity Services", "Heart Health Screening", "Postpartum Support"],
      language: ["English", "Spanish"],
    },
    {
      name: "Planned Parenthood - Orange",
      address: "1310 N Main St, Santa Ana, CA 92701",
      phone: "(800) 576-5544",
      distance: "5.8 miles",
      services: ["Women's Health", "Blood Pressure Screening", "Health Education"],
      language: ["English", "Spanish", "Tagalog"],
    },
  ];

  const supportGroups: SupportGroup[] = [
    {
      name: "Postpartum Support International - OC Chapter",
      type: "Postpartum Depression & Anxiety Support",
      schedule: "Every Tuesday, 6:00 PM - 7:30 PM",
      location: "Virtual & In-Person (Irvine)",
      contact: "(800) 944-4773",
    },
    {
      name: "Mamas Latinas - Grupo de Apoyo",
      type: "Spanish-Speaking Maternal Support",
      schedule: "Every Thursday, 5:00 PM - 6:30 PM",
      location: "Santa Ana Community Center",
      contact: "(714) 647-5400",
    },
    {
      name: "Heart Health for New Mothers",
      type: "Cardiovascular Health Education",
      schedule: "2nd and 4th Wednesday, 10:00 AM - 11:30 AM",
      location: "Hoag Hospital, Newport Beach",
      contact: "(949) 764-4624",
    },
  ];

  const bpScreeningLocations = [
    {
      name: "CVS MinuteClinic - Free BP Screening",
      address: "Multiple locations in Orange County",
      hours: "Walk-in hours: Mon-Fri 9am-7pm, Sat-Sun 10am-5pm",
      cost: "Free",
    },
    {
      name: "American Heart Association - Community Screenings",
      address: "Check website for monthly locations",
      hours: "Monthly community events",
      cost: "Free",
    },
    {
      name: "Orange County Health Care Agency",
      address: "405 W 5th St, Santa Ana, CA 92701",
      hours: "Mon-Fri 8am-5pm",
      cost: "Free or sliding scale",
    },
  ];

  return (
    <div className="p-6">
      {/* Health Alert - Demo Feature */}
      {showHealthAlert && (
        <Alert className="mb-6 border-2 border-red-500 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 font-['Montserrat'] font-bold text-lg">
            Important Health Alert
          </AlertTitle>
          <AlertDescription className="text-red-800 font-['Poppins'] text-sm mt-2">
            <p className="mb-2">
              We've noticed concerning patterns in your recent symptoms: shortness of breath (3 days), chest discomfort (2 days), and unusual fatigue.
            </p>
            <p className="mb-3 font-semibold">
              These symptoms may indicate a serious heart condition, even if you're not experiencing a "typical" heart attack.
              Many women, especially during pregnancy and postpartum, experience different heart attack symptoms than men.
            </p>
            <div className="flex gap-3">
              <Button className="bg-red-600 hover:bg-red-700 font-['Montserrat'] font-semibold">
                Find Nearest Emergency Care
              </Button>
              <Button variant="outline" className="border-red-600 text-red-600 font-['Montserrat'] font-semibold">
                Call 911
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowHealthAlert(false)}
                className="text-red-600"
              >
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-['Montserrat'] font-bold text-3xl text-[#172e54] mb-2">
          Resources & Support
        </h1>
        <p className="font-['Montserrat'] font-semibold text-base text-[#9e876e]">
          Find healthcare services, support groups, and educational resources near you
        </p>
      </div>

      {/* Location Search */}
      <Card className="bg-white p-5 rounded-3xl border-2 border-[#f3efe7] mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#bd8e84]" size={20} />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your ZIP code or city (e.g., Irvine, CA)"
              className="pl-10 rounded-2xl border-2 border-[#f3efe7] font-['Poppins'] text-sm"
            />
          </div>
          <Button className="rounded-2xl bg-[#f79891] hover:bg-[#f79891]/90 font-['Montserrat'] font-semibold text-sm">
            <Search size={18} className="mr-2" />
            Search
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="clinics" className="mb-6">
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
          <TabsTrigger value="advocate" className="rounded-2xl data-[state=active]:bg-white text-sm">
            Self-Advocacy
          </TabsTrigger>
          <TabsTrigger value="education" className="rounded-2xl data-[state=active]:bg-white text-sm">
            Education
          </TabsTrigger>
        </TabsList>

        {/* Nearby Clinics */}
        <TabsContent value="clinics" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Clinics Near You - Specialized in Maternal & Heart Health
          </h2>
          {clinics.map((clinic, idx) => (
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
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-[#caebfe] rounded-full font-['Poppins'] text-xs text-[#172e54]"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-['Poppins'] text-xs text-[#9e876e] mb-1">Languages Spoken:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {clinic.language.map((lang, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-[#f3efe7] rounded-full font-['Poppins'] text-xs text-[#172e54]"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="rounded-2xl bg-[#172e54] hover:bg-[#172e54]/90 text-sm">
                  Get Directions
                </Button>
              </div>
            </Card>
          ))}

          <div className="mt-4 p-4 bg-[#f3efe7] rounded-2xl">
            <p className="font-['Poppins'] text-sm text-[#172e54]">
              <strong>Note:</strong> These clinics offer services specifically tailored to Hispanic communities
              and postpartum care. Many accept Medi-Cal and offer sliding scale fees.
            </p>
          </div>
        </TabsContent>

        {/* Support Groups */}
        <TabsContent value="support" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Postpartum & Heart Health Support Groups
          </h2>
          {supportGroups.map((group, idx) => (
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
                    </p>
                    <p className="font-['Poppins'] text-sm text-[#172e54] flex items-center gap-2">
                      <Phone size={16} />
                      {group.contact}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl border-2 border-[#172e54] text-sm">
                  Join Group
                </Button>
              </div>
            </Card>
          ))}

          <div className="mt-4 p-4 bg-[#caebfe] rounded-2xl">
            <h4 className="font-['Montserrat'] font-semibold text-base text-[#172e54] mb-2">
              National Resources
            </h4>
            <ul className="space-y-2 font-['Poppins'] text-sm text-[#172e54]">
              <li>• <strong>Postpartum Support International:</strong> 1-800-944-4773 (English & Spanish)</li>
              <li>• <strong>National Maternal Mental Health Hotline:</strong> 1-833-943-5746 (24/7)</li>
              <li>• <strong>American Heart Association Women's Health:</strong> (877) 242-4277</li>
            </ul>
          </div>
        </TabsContent>

        {/* BP Screening Locations */}
        <TabsContent value="screening" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Free & Affordable Blood Pressure Screening
          </h2>
          {bpScreeningLocations.map((location, idx) => (
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
                <Button className="rounded-2xl bg-[#f79891] hover:bg-[#f79891]/90 text-sm">
                  Learn More
                </Button>
              </div>
            </Card>
          ))}

          <div className="mt-4 p-4 bg-[#f3efe7] rounded-2xl">
            <h4 className="font-['Montserrat'] font-semibold text-base text-[#172e54] mb-2">
              Why Regular BP Screening Matters
            </h4>
            <p className="font-['Poppins'] text-sm text-[#172e54] mb-3">
              High blood pressure is a leading cause of heart disease and stroke. For pregnant and postpartum women,
              regular monitoring is crucial to prevent preeclampsia and postpartum complications.
            </p>
            <p className="font-['Poppins'] text-sm text-[#172e54]">
              <strong>Recommended:</strong> Check your blood pressure at least once every 2 weeks during the first
              6 months postpartum, especially if you experienced high blood pressure during pregnancy.
            </p>
          </div>
        </TabsContent>

        {/* Self-Advocacy */}
        <TabsContent value="advocate" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            How to Advocate for Yourself
          </h2>

          <Card className="bg-gradient-to-r from-[#f79891]/20 to-[#caebfe]/20 p-5 rounded-2xl border-2 border-[#f79891]">
            <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-3">
              Your Rights as a Patient
            </h3>
            <ul className="space-y-2 font-['Poppins'] text-sm text-[#172e54]">
              <li>✓ You have the right to be heard and taken seriously</li>
              <li>✓ You can request a second opinion</li>
              <li>✓ You can bring a support person to appointments</li>
              <li>✓ You deserve clear explanations in your preferred language</li>
              <li>✓ You can request additional tests if you feel something is wrong</li>
            </ul>
          </Card>

          <Card className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7]">
            <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-3">
              What to Say When Your Concerns Are Dismissed
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#f3efe7] rounded-xl">
                <p className="font-['Poppins'] text-sm text-[#172e54] font-semibold mb-1">
                  "I understand your assessment, but I know my body, and something feels wrong."
                </p>
              </div>
              <div className="p-3 bg-[#caebfe] rounded-xl">
                <p className="font-['Poppins'] text-sm text-[#172e54] font-semibold mb-1">
                  "Please document in my chart that I requested [test/referral] and it was declined."
                </p>
              </div>
              <div className="p-3 bg-[#f3efe7] rounded-xl">
                <p className="font-['Poppins'] text-sm text-[#172e54] font-semibold mb-1">
                  "These symptoms are unusual for me. I'd like to rule out serious conditions."
                </p>
              </div>
              <div className="p-3 bg-[#caebfe] rounded-xl">
                <p className="font-['Poppins'] text-sm text-[#172e54] font-semibold mb-1">
                  "I'd like a referral to a specialist who has experience with [your specific concern]."
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7]">
            <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-3">
              Warning Signs NOT to Ignore
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                <h4 className="font-['Montserrat'] font-semibold text-sm text-red-900 mb-2">Heart Attack Symptoms in Women:</h4>
                <ul className="space-y-1 font-['Poppins'] text-xs text-red-800">
                  <li>• Unusual fatigue</li>
                  <li>• Shortness of breath</li>
                  <li>• Nausea or indigestion</li>
                  <li>• Back, shoulder, or jaw pain</li>
                  <li>• Chest discomfort (not always severe)</li>
                </ul>
              </div>
              <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                <h4 className="font-['Montserrat'] font-semibold text-sm text-orange-900 mb-2">Postpartum Emergencies:</h4>
                <ul className="space-y-1 font-['Poppins'] text-xs text-orange-800">
                  <li>• Severe headaches</li>
                  <li>• Vision changes</li>
                  <li>• High blood pressure (140/90+)</li>
                  <li>• Chest pain or rapid heartbeat</li>
                  <li>• Severe abdominal pain</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 font-['Poppins'] text-sm text-[#172e54] font-semibold text-center">
              If you experience any of these symptoms, seek immediate medical care. Don't wait to see if they go away.
            </p>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education" className="mt-4 space-y-3">
          <h2 className="font-['Montserrat'] font-bold text-xl text-[#172e54] mb-3">
            Heart Health Education by Life Stage
          </h2>

          <Card className="bg-[#caebfe] p-5 rounded-2xl border-0">
            <div className="flex items-start gap-4">
              <GraduationCap className="text-[#172e54] flex-shrink-0" size={32} />
              <div>
                <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-2">
                  Teens & Young Adults (13-25)
                </h3>
                <p className="font-['Poppins'] text-sm text-[#172e54] mb-3">
                  Building healthy habits early is key to lifelong heart health. Focus on nutrition, exercise, and understanding your body.
                </p>
                <ul className="space-y-1 font-['Poppins'] text-sm text-[#172e54]">
                  <li>• Understanding your baseline heart health</li>
                  <li>• Birth control and cardiovascular risks</li>
                  <li>• Healthy eating patterns for heart health</li>
                  <li>• Exercise recommendations for teens</li>
                  <li>• Recognizing early warning signs</li>
                </ul>
                <Button className="mt-3 rounded-2xl bg-[#172e54] hover:bg-[#172e54]/90 text-sm">
                  Access Teen Resources
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-[#f3efe7] p-5 rounded-2xl border-0">
            <div className="flex items-start gap-4">
              <Heart className="text-[#f79891] flex-shrink-0" size={32} />
              <div>
                <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-2">
                  Expecting & New Mothers
                </h3>
                <p className="font-['Poppins'] text-sm text-[#172e54] mb-3">
                  Pregnancy and postpartum periods are critical times for heart health. Learn about risks and how to protect yourself.
                </p>
                <ul className="space-y-1 font-['Poppins'] text-sm text-[#172e54]">
                  <li>• Preeclampsia and gestational hypertension</li>
                  <li>• Postpartum cardiomyopathy warning signs</li>
                  <li>• Managing high blood pressure after delivery</li>
                  <li>• Nutrition for heart health while breastfeeding</li>
                  <li>• When to seek emergency care postpartum</li>
                  <li>• Long-term cardiovascular risks after pregnancy complications</li>
                </ul>
                <Button className="mt-3 rounded-2xl bg-[#f79891] hover:bg-[#f79891]/90 text-sm">
                  Maternal Health Guide
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-5 rounded-2xl border-2 border-[#f3efe7]">
            <div className="flex items-start gap-4">
              <Users className="text-[#bd8e84] flex-shrink-0" size={32} />
              <div>
                <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-2">
                  Adults (26-50)
                </h3>
                <p className="font-['Poppins'] text-sm text-[#172e54] mb-3">
                  Prevention and early detection are crucial. Know your numbers and risk factors.
                </p>
                <ul className="space-y-1 font-['Poppins'] text-sm text-[#172e54]">
                  <li>• Understanding cholesterol and blood pressure</li>
                  <li>• Lifestyle modifications for heart health</li>
                  <li>• Stress management and heart disease</li>
                  <li>• Women's unique cardiovascular risk factors</li>
                  <li>• Recommended screening schedule</li>
                </ul>
                <Button className="mt-3 rounded-2xl bg-[#172e54] hover:bg-[#172e54]/90 text-sm">
                  Prevention Resources
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-[#f3efe7] p-5 rounded-2xl border-0">
            <div className="flex items-start gap-4">
              <Heart className="text-[#172e54] flex-shrink-0" size={32} />
              <div>
                <h3 className="font-['Montserrat'] font-bold text-lg text-[#172e54] mb-2">
                  Menopause & Beyond (50+)
                </h3>
                <p className="font-['Poppins'] text-sm text-[#172e54] mb-3">
                  Heart disease risk increases after menopause. Stay informed and proactive about your heart health.
                </p>
                <ul className="space-y-1 font-['Poppins'] text-sm text-[#172e54]">
                  <li>• How menopause affects heart health</li>
                  <li>• Hormone replacement therapy considerations</li>
                  <li>• Managing cholesterol during menopause</li>
                  <li>• Exercise and nutrition for aging hearts</li>
                  <li>• Recognizing heart attack symptoms in older women</li>
                </ul>
                <Button className="mt-3 rounded-2xl bg-[#172e54] hover:bg-[#172e54]/90 text-sm">
                  Menopause Heart Health
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-4 p-4 bg-gradient-to-r from-[#f79891]/20 to-[#caebfe]/20 rounded-2xl border-2 border-[#bd8e84]">
            <h4 className="font-['Montserrat'] font-semibold text-base text-[#172e54] mb-2">
              Additional Resources
            </h4>
            <ul className="space-y-2 font-['Poppins'] text-sm text-[#172e54]">
              <li>• <strong>CDC Heart Disease Resources:</strong> cdc.gov/heartdisease</li>
              <li>• <strong>NIH Women's Health:</strong> nih.gov/womenshealth</li>
              <li>• <strong>American Heart Association Go Red for Women:</strong> goredforwomen.org</li>
              <li>• <strong>Office on Women's Health (HHS):</strong> womenshealth.gov</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
