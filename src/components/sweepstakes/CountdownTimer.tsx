
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  timeLeft: TimeLeft;
}

export const CountdownTimer = ({ timeLeft }: CountdownTimerProps) => {
  return (
    <section className="py-12 bg-[#F1F1F1]">
      <div className="container mx-auto px-3">
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center pb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8 mt-4">Time Left to Enter!</h2>
            <div className="flex justify-center space-x-4 text-center mt-8">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Minutes" />
              <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>
          </CardHeader>
          <CardContent className="text-center px-8 pb-8">
            <p className="text-lg text-gray-600 leading-relaxed">
              Ready to kick off the school year with a bang? Enter our $1,000 School Supply Giveaway for a chance to win everything you need for an awesome academic year! 🎒✏️
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="bg-[#F1F1F1] px-4 py-2 rounded-lg">
    <div className="text-3xl font-bold text-[#15b0f8]">{value}</div>
    <div className="text-sm text-[#15b0f8]">{label}</div>
  </div>
);
