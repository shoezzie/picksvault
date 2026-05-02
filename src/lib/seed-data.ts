export type PickStatus = 'active' | 'locked' | 'graded' | 'void' | 'postponed'
export type PickTier = 'insured' | 'verified'

export interface SeedPick {
  id: number
  sportKey: string
  sport: string
  tag: string
  game: string
  time: string
  lockMins: number
  price: number
  tier: PickTier
  seller: string
  verified: boolean
  hit: string
  roi: string
  confidence: number
  buyers: number
  viewers: number
  stake: number
  oddsRange: string
  signals: string[]
  streak: string[]
  status: PickStatus
  description?: string
  reasoning?: string
}

export const SEED_PICKS: SeedPick[] = [
  { id: 1, sportKey: 'mlb', sport: 'MLB', tag: 'Hitter Prop', game: 'NYY vs BOS', time: '7:05 PM ET', lockMins: 42, price: 5, tier: 'insured', seller: '@firstpitch', verified: true, hit: '58.1%', roi: '+8.2%', confidence: 3, buyers: 38, viewers: 14, stake: 120, oddsRange: '+105 / +130', signals: ['hot', 'sharp'], streak: ['W','W','L','W','W','W','L','W','W','W'], status: 'active', description: 'Aaron Judge O1.5 TB', reasoning: 'Judge has hit the over in 7 of his last 10 vs RHP with exit velo >105. Whitlock has a 1.62 HR/9 vs righties this season. Park factor favors righty pull power, wind 8mph out to RF. Model projects 2.3 TB vs market line 1.5.' },
  { id: 2, sportKey: 'nba', sport: 'NBA', tag: 'Player Prop', game: 'BOS vs PHI', time: '7:30 PM ET', lockMins: 67, price: 6, tier: 'verified', seller: '@hoopsedge', verified: true, hit: '56.1%', roi: '+5.4%', confidence: 2, buyers: 24, viewers: 8, stake: 80, oddsRange: '-115 / -105', signals: ['sharp'], streak: ['L','W','W','W','L','W','W','L','W','W'], status: 'active', description: 'Jayson Tatum O28.5 PTS', reasoning: 'Tatum has scored 30+ in 5 straight vs Philly defense. Harris is questionable, creating defensive mismatch.' },
  { id: 3, sportKey: 'mlb', sport: 'MLB', tag: 'Pitcher Prop', game: 'NYY vs BOS', time: '7:05 PM ET', lockMins: 42, price: 4, tier: 'insured', seller: '@strikezone', verified: true, hit: '60.2%', roi: '+11.1%', confidence: 3, buyers: 52, viewers: 23, stake: 200, oddsRange: '-120 / -110', signals: ['hot', 'pocket'], streak: ['W','W','W','L','W','W','W','W','L','W'], status: 'active', description: 'Gerrit Cole O7.5 K', reasoning: 'Cole has gone over 7.5 Ks in 8 of his last 10 starts. Boston lineup ranks 28th vs RHP strikeout rate. Cole is fresh off 4-day rest.' },
  { id: 4, sportKey: 'nfl', sport: 'NFL', tag: 'Game Line', game: 'BAL vs CIN', time: 'Sun 1:00 PM', lockMins: 189, price: 8, tier: 'verified', seller: '@gridironguru', verified: false, hit: '53.0%', roi: '+3.8%', confidence: 2, buyers: 18, viewers: 5, stake: 60, oddsRange: '-110 / +100', signals: ['fresh'], streak: ['W','L','W','L','W','W','L','W','L','W'], status: 'active', description: 'BAL -3 vs CIN', reasoning: 'Baltimore defense allows fewest yards per game at home. Burrow still recovering from wrist issue. Ravens offense clicking at 78% efficiency.' },
  { id: 5, sportKey: 'mlb', sport: 'MLB', tag: '3-Leg Parlay', game: 'NYY vs BOS', time: '7:05 PM ET', lockMins: 42, price: 7, tier: 'insured', seller: '@firstpitch', verified: true, hit: '58.1%', roi: '+8.2%', confidence: 1, buyers: 14, viewers: 11, stake: 90, oddsRange: '+450 / +600', signals: ['fade'], streak: ['W','W','L','W','W','W','L','W','W','W'], status: 'active', description: '3-leg parlay: Judge O1.5TB + Cole O7.5K + BOS ML', reasoning: 'These three legs correlate positively — strong Judge game means Cole facing a tough lineup which means strikeout upside increases.' },
  { id: 6, sportKey: 'nhl', sport: 'NHL', tag: 'Skater Prop', game: 'EDM vs CGY', time: '9:00 PM ET', lockMins: 152, price: 3, tier: 'insured', seller: '@icecold', verified: true, hit: '54.4%', roi: '+4.7%', confidence: 2, buyers: 22, viewers: 7, stake: 75, oddsRange: '+110 / +135', signals: ['fresh'], streak: ['L','W','W','L','W','W','W','L','W','W'], status: 'active', description: 'McDavid O0.5 Goals', reasoning: 'McDavid has scored in 6 straight vs Calgary. Power play is clicking at 35% efficiency. Markstrom has .880 save % in last 5 vs Edmonton.' },
  { id: 7, sportKey: 'mlb', sport: 'MLB', tag: 'Hitter Prop', game: 'NYY vs BOS', time: '7:05 PM ET', lockMins: 42, price: 5, tier: 'insured', seller: '@bombsquad', verified: false, hit: '55.7%', roi: '+6.9%', confidence: 2, buyers: 9, viewers: 4, stake: 50, oddsRange: '+140 / +170', signals: ['pocket'], streak: ['W','L','W','W','L','W','W','L','W','W'], status: 'active', description: 'Stanton O0.5 HR', reasoning: 'Stanton is 8 for 18 vs Sale in his career with 3 HRs. Left-center wind is blowing out. Stanton exit velo avg 102.3 this season.' },
  { id: 8, sportKey: 'nba', sport: 'NBA', tag: 'Game Line', game: 'BOS vs PHI', time: '7:30 PM ET', lockMins: 67, price: 4, tier: 'verified', seller: '@theliner', verified: false, hit: '52.3%', roi: '+2.1%', confidence: 1, buyers: 6, viewers: 3, stake: 40, oddsRange: '-108 / +102', signals: [], streak: ['L','W','L','W','W','L','W','L','W','W'], status: 'active', description: 'BOS -4.5 vs PHI', reasoning: 'Celtics at home are 18-4 ATS this season. Philadelphia missing 2 starters. Boston 3-game homestand.' },
]

export const SEED_SELLERS = [
  { handle: '@firstpitch', name: 'First Pitch', avatar: 'F', sport: 'MLB hitter props', hit: '58.1%', roi: '+8.2%', units: '+7.4u', picks: 39, followers: 1284, verified: true, badge: 'Pikkit-verified', stakeBalance: 2400 },
  { handle: '@strikezone', name: 'Strike Zone', avatar: 'S', sport: 'Pitcher Ks', hit: '60.2%', roi: '+11.1%', units: '+9.4u', picks: 31, followers: 2104, verified: true, badge: 'Pikkit-verified', stakeBalance: 3200 },
  { handle: '@hoopsedge', name: 'Hoops Edge', avatar: 'H', sport: 'NBA props', hit: '56.1%', roi: '+5.4%', units: '+5.2u', picks: 62, followers: 842, verified: true, badge: 'On-platform 6mo', stakeBalance: 1800 },
  { handle: '@icecold', name: 'Ice Cold', avatar: 'I', sport: 'NHL specialist', hit: '54.4%', roi: '+4.7%', units: '+3.3u', picks: 28, followers: 476, verified: true, badge: 'On-platform 4mo', stakeBalance: 900 },
  { handle: '@gridironguru', name: 'Gridiron', avatar: 'G', sport: 'NFL game lines', hit: '53.0%', roi: '+3.8%', units: '+1.9u', picks: 18, followers: 312, verified: false, badge: 'New seller', stakeBalance: 600 },
  { handle: '@bombsquad', name: 'Bomb Squad', avatar: 'B', sport: 'MLB power hitters', hit: '55.7%', roi: '+6.9%', units: '+4.2u', picks: 24, followers: 603, verified: false, badge: 'Unverified', stakeBalance: 750 },
  { handle: '@theliner', name: 'The Liner', avatar: 'T', sport: 'NBA game lines', hit: '52.3%', roi: '+2.1%', units: '+0.8u', picks: 14, followers: 188, verified: false, badge: 'New seller', stakeBalance: 400 },
]

export const SEED_LEADERBOARD = [
  { rank: 1, handle: '@strikezone', sport: 'MLB', picks: 31, hit: '60.2%', roi: '+11.1%', units: '+9.4', price: '$4', verified: true },
  { rank: 2, handle: '@firstpitch', sport: 'MLB', picks: 39, hit: '58.1%', roi: '+8.2%', units: '+7.4', price: '$5', verified: true },
  { rank: 3, handle: '@bombsquad', sport: 'MLB', picks: 24, hit: '55.7%', roi: '+6.9%', units: '+4.2', price: '$5', verified: false },
  { rank: 4, handle: '@hoopsedge', sport: 'NBA', picks: 62, hit: '56.1%', roi: '+5.4%', units: '+5.2', price: '$6', verified: true },
  { rank: 5, handle: '@icecold', sport: 'NHL', picks: 28, hit: '54.4%', roi: '+4.7%', units: '+3.3', price: '$3', verified: true },
  { rank: 6, handle: '@gridironguru', sport: 'NFL', picks: 18, hit: '53.0%', roi: '+3.8%', units: '+1.9', price: '$8', verified: false },
  { rank: 7, handle: '@theliner', sport: 'NBA', picks: 14, hit: '52.3%', roi: '+2.1%', units: '+0.8', price: '$4', verified: false },
  { rank: 8, handle: '@futuresbiz', sport: 'Multi', picks: 12, hit: '51.1%', roi: '+1.4%', units: '+0.3', price: '$7', verified: true },
]

export const SIGNAL_META: Record<string, { icon: string; label: string; cls: string }> = {
  hot:    { icon: 'Flame',       label: 'Hot',        cls: 'signal-hot'    },
  sharp:  { icon: 'TrendingUp',  label: 'Sharp',      cls: 'signal-sharp'  },
  fresh:  { icon: 'Zap',        label: 'Fresh',      cls: 'signal-fresh'  },
  pocket: { icon: 'Target',      label: 'Pocket',     cls: 'signal-pocket' },
  fade:   { icon: 'ShieldAlert', label: 'Contrarian', cls: 'signal-fade'   },
}
