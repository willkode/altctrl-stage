import InvestorHero from "../components/investors/InvestorHero";
import MarketOpportunity from "../components/investors/MarketOpportunity";
import LivestreamExplosion from "../components/investors/LivestreamExplosion";
import TikTokMomentum from "../components/investors/TikTokMomentum";
import VisionRoadmap from "../components/investors/VisionRoadmap";
import CompetitiveLandscape from "../components/investors/CompetitiveLandscape";
import UnitEconomics from "../components/investors/UnitEconomics";
import TAMModel from "../components/investors/TAMModel";
import RevenueScenarios from "../components/investors/RevenueScenarios";
import InvestorConcerns from "../components/investors/InvestorConcerns";
import KeyNumbers from "../components/investors/KeyNumbers";
import InvestorContact from "../components/investors/InvestorContact";

export default function Investors() {
  return (
    <div className="min-h-screen">
      <InvestorHero />
      <MarketOpportunity />
      <LivestreamExplosion />
      <TikTokMomentum />
      <VisionRoadmap />
      <CompetitiveLandscape />
      <UnitEconomics />
      <TAMModel />
      <RevenueScenarios />
      <InvestorConcerns />
      <KeyNumbers />
      <InvestorContact />
    </div>
  );
}