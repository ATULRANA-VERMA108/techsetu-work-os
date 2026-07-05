import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Save, 
  Sparkles, 
  Trophy, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Zap, 
  Plus, 
  Calendar,
  Briefcase,
  ShoppingBag,
  DollarSign,
  Info,
  Award,
  Compass
} from 'lucide-react';

interface KidsGameLabProps {
  onRewardXP: (amount: number) => void;
  isEasyMode: boolean;
}

type BlockType = 'road' | 'sidewalk' | 'skyscraper' | 'office' | 'shop' | 'bank' | 'tree' | 'car';

interface BlockData {
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

interface CityTask {
  id: string;
  title: string;
  type: 'work' | 'shop' | 'bank';
  targetCompleted: boolean;
  xpReward: number;
}

interface GameAchievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  xpVal: number;
}

// GTA High-Graphics Synthesized Audio System
class CityAudioSynth {
  private ctx: AudioContext | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;
  private screechOsc: OscillatorNode | null = null;
  private screechGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Continuous car engine hum
  startEngine() {
    this.initCtx();
    if (!this.ctx || this.motorOsc) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, this.ctx.currentTime); // Low idle rumble
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    
    this.motorOsc = osc;
    this.motorGain = gain;
  }

  updateEnginePitch(speed: number, maxSpeed: number) {
    if (!this.ctx || !this.motorOsc) return;
    const ratio = Math.abs(speed) / maxSpeed;
    const targetFreq = 45 + ratio * 150; // Pitch rises with speed
    this.motorOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
  }

  stopEngine() {
    if (this.motorOsc) {
      try { this.motorOsc.stop(); } catch (e) {}
      this.motorOsc = null;
    }
    this.motorGain = null;
    this.stopScreech();
  }

  // Continuous tire screeching sound (during drifts)
  startScreech() {
    this.initCtx();
    if (!this.ctx || this.screechOsc) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // High pitch squeal
    
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    
    this.screechOsc = osc;
    this.screechGain = gain;
  }

  updateScreechPitch(driftIntensity: number) {
    if (!this.ctx || !this.screechOsc) return;
    // Screech pitches sweep based on slip angle
    const targetFreq = 880 + driftIntensity * 200;
    this.screechOsc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
  }

  stopScreech() {
    if (this.screechOsc) {
      try { this.screechOsc.stop(); } catch (e) {}
      this.screechOsc = null;
    }
    this.screechGain = null;
  }

  playHorn() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const playBeep = (freq: number, start: number, dur: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.005, start + dur);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(start);
      osc.stop(start + dur);
    };

    playBeep(440, now, 0.15);
    playBeep(440, now + 0.18, 0.15);
  }

  playCrash() {
    this.initCtx();
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(25, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.35);
  }

  playTaskComplete() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    scale.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      
      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.08 + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.18);
    });
  }
}

const citySynth = new CityAudioSynth();

// Massive 32x32 City Map Layout Preset Level (Best Graphics & Full Gameplay Platform)
const EXPANDED_CITY_PRESETS = [
  {
    id: 1,
    title: '🌆 San Techsetu Downtown Core',
    description: 'A massive 32x32 layout featuring a highway ring, intersections, pedestrian sidewalks, a skyscrapers row, parks, helipad, and driveable sports car.',
    xpReward: 50,
    blocks: [
      // Major Outer Highway Ring (z = -6, z = 6, x = -10, x = 10)
      { x: -10, y: 0, z: -6, type: 'road' }, { x: -9, y: 0, z: -6, type: 'road' }, { x: -8, y: 0, z: -6, type: 'road' },
      { x: -7, y: 0, z: -6, type: 'road' }, { x: -6, y: 0, z: -6, type: 'road' }, { x: -5, y: 0, z: -6, type: 'road' },
      { x: -4, y: 0, z: -6, type: 'road' }, { x: -3, y: 0, z: -6, type: 'road' }, { x: -2, y: 0, z: -6, type: 'road' },
      { x: -1, y: 0, z: -6, type: 'road' }, { x: 0, y: 0, z: -6, type: 'road' }, { x: 1, y: 0, z: -6, type: 'road' },
      { x: 2, y: 0, z: -6, type: 'road' }, { x: 3, y: 0, z: -6, type: 'road' }, { x: 4, y: 0, z: -6, type: 'road' },
      { x: 5, y: 0, z: -6, type: 'road' }, { x: 6, y: 0, z: -6, type: 'road' }, { x: 7, y: 0, z: -6, type: 'road' },
      { x: 8, y: 0, z: -6, type: 'road' }, { x: 9, y: 0, z: -6, type: 'road' }, { x: 10, y: 0, z: -6, type: 'road' },

      { x: -10, y: 0, z: 6, type: 'road' }, { x: -9, y: 0, z: 6, type: 'road' }, { x: -8, y: 0, z: 6, type: 'road' },
      { x: -7, y: 0, z: 6, type: 'road' }, { x: -6, y: 0, z: 6, type: 'road' }, { x: -5, y: 0, z: 6, type: 'road' },
      { x: -4, y: 0, z: 6, type: 'road' }, { x: -3, y: 0, z: 6, type: 'road' }, { x: -2, y: 0, z: 6, type: 'road' },
      { x: -1, y: 0, z: 6, type: 'road' }, { x: 0, y: 0, z: 6, type: 'road' }, { x: 1, y: 0, z: 6, type: 'road' },
      { x: 2, y: 0, z: 6, type: 'road' }, { x: 3, y: 0, z: 6, type: 'road' }, { x: 4, y: 0, z: 6, type: 'road' },
      { x: 5, y: 0, z: 6, type: 'road' }, { x: 6, y: 0, z: 6, type: 'road' }, { x: 7, y: 0, z: 6, type: 'road' },
      { x: 8, y: 0, z: 6, type: 'road' }, { x: 9, y: 0, z: 6, type: 'road' }, { x: 10, y: 0, z: 6, type: 'road' },

      // Left & Right Outer Roads
      { x: -10, y: 0, z: -5, type: 'road' }, { x: -10, y: 0, z: -4, type: 'road' }, { x: -10, y: 0, z: -3, type: 'road' },
      { x: -10, y: 0, z: -2, type: 'road' }, { x: -10, y: 0, z: -1, type: 'road' }, { x: -10, y: 0, z: 0, type: 'road' },
      { x: -10, y: 0, z: 1, type: 'road' }, { x: -10, y: 0, z: 2, type: 'road' }, { x: -10, y: 0, z: 3, type: 'road' },
      { x: -10, y: 0, z: 4, type: 'road' }, { x: -10, y: 0, z: 5, type: 'road' },

      { x: 10, y: 0, z: -5, type: 'road' }, { x: 10, y: 0, z: -4, type: 'road' }, { x: 10, y: 0, z: -3, type: 'road' },
      { x: 10, y: 0, z: -2, type: 'road' }, { x: 10, y: 0, z: -1, type: 'road' }, { x: 10, y: 0, z: 0, type: 'road' },
      { x: 10, y: 0, z: 1, type: 'road' }, { x: 10, y: 0, z: 2, type: 'road' }, { x: 10, y: 0, z: 3, type: 'road' },
      { x: 10, y: 0, z: 4, type: 'road' }, { x: 10, y: 0, z: 5, type: 'road' },

      // Center Avenue (x = 0)
      { x: 0, y: 0, z: -5, type: 'road' }, { x: 0, y: 0, z: -4, type: 'road' }, { x: 0, y: 0, z: -3, type: 'road' },
      { x: 0, y: 0, z: -2, type: 'road' }, { x: 0, y: 0, z: -1, type: 'road' }, { x: 0, y: 0, z: 0, type: 'road' },
      { x: 0, y: 0, z: 1, type: 'road' }, { x: 0, y: 0, z: 2, type: 'road' }, { x: 0, y: 0, z: 3, type: 'road' },
      { x: 0, y: 0, z: 4, type: 'road' }, { x: 0, y: 0, z: 5, type: 'road' },

      // Sidewalks
      { x: -9, y: 0, z: -5, type: 'sidewalk' }, { x: -8, y: 0, z: -5, type: 'sidewalk' },
      { x: 8, y: 0, z: -5, type: 'sidewalk' }, { x: 9, y: 0, z: -5, type: 'sidewalk' },
      { x: -9, y: 0, z: 5, type: 'sidewalk' }, { x: -8, y: 0, z: 5, type: 'sidewalk' },
      { x: 8, y: 0, z: 5, type: 'sidewalk' }, { x: 9, y: 0, z: 5, type: 'sidewalk' },
      { x: -1, y: 0, z: 0, type: 'sidewalk' }, { x: 1, y: 0, z: 0, type: 'sidewalk' },

      // Corporate Skyscrapers (x = -4, x = 4)
      { x: -5, y: 0, z: -3, type: 'skyscraper' },
      { x: 5, y: 0, z: -3, type: 'skyscraper' },
      { x: -5, y: 0, z: 3, type: 'skyscraper' },
      { x: 5, y: 0, z: 3, type: 'skyscraper' },

      // Key Mission Buildings
      { x: -4, y: 0, z: 0, type: 'office' }, // Main Office
      { x: 4, y: 0, z: 0, type: 'bank' },     // Bank ATM
      { x: 0, y: 0, z: -4, type: 'shop' },    // Supermarket Store

      // City Park Trees & Benches
      { x: -7, y: 0, z: -2, type: 'tree' },
      { x: -7, y: 0, z: 2, type: 'tree' },
      { x: 7, y: 0, z: -2, type: 'tree' },
      { x: 7, y: 0, z: 2, type: 'tree' },

      // Sports Car Spawn Point
      { x: -6, y: 0, z: -6, type: 'car' }
    ] as BlockData[]
  }
];

export const KidsGameLab: React.FC<KidsGameLabProps> = ({ onRewardXP, isEasyMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('road');
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    const saved = localStorage.getItem('techsetu-gta-city-custom-v2');
    return saved ? JSON.parse(saved) : EXPANDED_CITY_PRESETS[0].blocks;
  });
  
  // Driving & HUD states
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [carSpeed, setCarSpeed] = useState<number>(0);
  const [driftSlideTime, setDriftSlideTime] = useState<number>(0);
  const [isDriftingVisual, setIsDriftingVisual] = useState<boolean>(false);
  const [closestTargetDist, setClosestTargetDist] = useState<number | null>(null);
  const [closestTargetAngle, setClosestTargetAngle] = useState<number>(0);
  const [activeQuestTitle, setActiveQuestTitle] = useState<string>('');

  // Missions
  const [tasks, setTasks] = useState<CityTask[]>([
    { id: 't1', title: 'Audit server telemetry connection leaks at Office', type: 'work', targetCompleted: false, xpReward: 40 },
    { id: 't2', title: 'Withdraw dopamine piggybank cash at Bank', type: 'bank', targetCompleted: false, xpReward: 30 },
    { id: 't3', title: 'Buy weekly grocery supplies at Supermarket', type: 'shop', targetCompleted: false, xpReward: 35 }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'work' | 'shop' | 'bank'>('work');

  // Achievements
  const [achievements, setAchievements] = useState<GameAchievement[]>([
    { id: 'ach_speed', title: '⚡ Speed Demon', desc: 'Reach 80 KM/H driving speed', unlocked: false, xpVal: 50 },
    { id: 'ach_drift', title: '💨 Drift King', desc: 'Perform a continuous rubber drift for 1.5s', unlocked: false, xpVal: 60 },
    { id: 'ach_tour', title: '🌆 City Navigator', desc: 'Arrive at all 3 landmarks (Office, Bank, Shop)', unlocked: false, xpVal: 100 }
  ]);

  // Victory Overlay states
  const [showVictoryScreen, setShowVictoryScreen] = useState<boolean>(false);
  const [victoryXP, setVictoryXP] = useState<number>(0);
  const [victoryTitle, setVictoryTitle] = useState<string>( '');

  // ThreeJS References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number | null>(null);
  const blocksMeshesRef = useRef<{ [key: string]: THREE.Mesh | THREE.Group }>({});
  
  // Entity references
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const carModelRef = useRef<THREE.Group | null>(null);
  
  // Physics refs
  const playerPosVec = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.4, 3));
  const carPosVec = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.18, 0));
  const carAngle = useRef<number>(0);
  const carVelocity = useRef<number>(0);
  const driftAngle = useRef<number>(0);
  const driftTimer = useRef<number>(0);

  // Tire Smoke Particle System
  const smokeParticles = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; age: number; maxAge: number }[]>([]);

  // Input states
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const saveCity = () => {
    localStorage.setItem('techsetu-gta-city-custom-v2', JSON.stringify(blocks));
    setActiveChallengeId(null);
  };

  const clearCity = () => {
    setBlocks([{ x: 0, y: 0, z: 0, type: 'road' }]);
    setActiveChallengeId(null);
    setIsDriving(false);
  };

  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(1);
  const loadPreset = (id: number) => {
    const layout = EXPANDED_CITY_PRESETS.find(c => c.id === id);
    if (layout) {
      setBlocks(layout.blocks);
      setActiveChallengeId(id);
      setIsPlaying(false);
      setIsDriving(false);
      setShowVictoryScreen(false);
      setTasks(prev => prev.map(t => ({ ...t, targetCompleted: false })));
      // Reset achievements
      setAchievements(prev => prev.map(a => ({ ...a, unlocked: false })));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: CityTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      type: newTaskType,
      targetCompleted: false,
      xpReward: Math.floor(Math.random() * 25) + 20
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && isPlaying) {
        e.preventDefault();
      }
      if (e.code === 'KeyF' && isPlaying) {
        toggleCarDriving();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      citySynth.stopEngine();
    };
  }, [isPlaying, isDriving, blocks]);

  // Enter/Exit Car toggle
  const toggleCarDriving = () => {
    if (!carModelRef.current || !playerGroupRef.current) return;
    
    if (isDriving) {
      setIsDriving(false);
      citySynth.stopEngine();
      setCarSpeed(0);
      setIsDriftingVisual(false);
      
      const carPos = carModelRef.current.position;
      playerPosVec.current.set(
        carPos.x - Math.sin(carAngle.current + Math.PI/2) * 1.2,
        0.4,
        carPos.z - Math.cos(carAngle.current + Math.PI/2) * 1.2
      );
      playerGroupRef.current.position.copy(playerPosVec.current);
      playerGroupRef.current.visible = true;
    } else {
      const playerPos = playerGroupRef.current.position;
      const carPos = carModelRef.current.position;
      const dist = playerPos.distanceTo(carPos);
      
      if (dist < 2.0) {
        setIsDriving(true);
        citySynth.startEngine();
        playerGroupRef.current.visible = false;
        carAngle.current = carModelRef.current.rotation.y;
      }
    }
  };

  // Main 3D Canvas setup & Rendering
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07070f'); // Ultra dark midnight glow
    scene.fog = new THREE.FogExp2('#07070f', 0.022);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 16, 22);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controlsRef.current = controls;

    // Soft lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambientLight);

    // Glowing Moonlight
    const moonLight = new THREE.DirectionalLight(0xb4eafc, 0.7);
    moonLight.position.set(-30, 50, -15);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048; // High resolution soft shadows
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0008;
    scene.add(moonLight);

    // Dark Tarmac grid floor base
    const floorGeom = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f0f15, roughness: 0.98 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.505;
    floor.receiveShadow = true;
    scene.add(floor);

    // Renders Premium City Meshes
    const renderCityBlocks = () => {
      Object.values(blocksMeshesRef.current).forEach(m => scene.remove(m));
      blocksMeshesRef.current = {};

      let carSpawnPos = new THREE.Vector3(0, 0.18, 0);

      blocks.forEach((b, idx) => {
        const key = `${b.x},${b.y},${b.z}`;

        if (b.type === 'car') {
          carSpawnPos.set(b.x, 0.18, b.z);
          return;
        }

        let meshGroup = new THREE.Group();

        switch (b.type) {
          case 'road': {
            // Tarmac gray box
            const road = new THREE.Mesh(
              new THREE.BoxGeometry(0.99, 0.1, 0.99),
              new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.9 })
            );
            road.receiveShadow = true;
            meshGroup.add(road);

            // Dash lines
            const dash = new THREE.Mesh(
              new THREE.BoxGeometry(0.08, 0.012, 0.48),
              new THREE.MeshBasicMaterial({ color: 0xfef08a })
            );
            dash.position.set(0, 0.052, 0);
            meshGroup.add(dash);
            break;
          }
          case 'sidewalk': {
            const side = new THREE.Mesh(
              new THREE.BoxGeometry(0.99, 0.16, 0.99),
              new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 })
            );
            side.receiveShadow = true;
            meshGroup.add(side);
            break;
          }
          case 'skyscraper': {
            // High-fidelity skyscraper with grid windows!
            const height = 4.5 + (idx % 3) * 2;
            const tower = new THREE.Mesh(
              new THREE.BoxGeometry(0.96, height, 0.96),
              new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.92, roughness: 0.05, transparent: true, opacity: 0.92 })
            );
            tower.position.y = height / 2 - 0.1;
            tower.castShadow = true;
            tower.receiveShadow = true;
            meshGroup.add(tower);

            // Adding grids of windows programmatically
            for (let h = 0.5; h < height - 0.5; h += 0.8) {
              for (let side = 0; side < 4; side++) {
                for (let offset = -0.3; offset <= 0.3; offset += 0.3) {
                  if (Math.random() < 0.45) { // 45% of windows are lit up
                    const windowGeom = new THREE.BoxGeometry(0.08, 0.12, 0.01);
                    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
                    const windowMesh = new THREE.Mesh(windowGeom, windowMat);
                    
                    if (side === 0) windowMesh.position.set(offset, h, 0.482);
                    else if (side === 1) { windowMesh.position.set(offset, h, -0.482); windowMesh.rotation.y = Math.PI; }
                    else if (side === 2) { windowMesh.position.set(0.482, h, offset); windowMesh.rotation.y = Math.PI / 2; }
                    else { windowMesh.position.set(-0.482, h, offset); windowMesh.rotation.y = -Math.PI / 2; }
                    
                    meshGroup.add(windowMesh);
                  }
                }
              }
            }

            // Spire
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), new THREE.MeshBasicMaterial({ color: 0x00f0b5 }));
            cap.position.set(0, height, 0);
            meshGroup.add(cap);
            break;
          }
          case 'office': {
            const body = new THREE.Mesh(
              new THREE.BoxGeometry(0.98, 3.2, 0.98),
              new THREE.MeshStandardMaterial({ color: 0x065f46, metalness: 0.8, roughness: 0.1 })
            );
            body.position.y = 1.6 - 0.1;
            body.castShadow = true;
            meshGroup.add(body);

            // Office floating label
            const label = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
            label.position.set(0, 3.4, 0);
            meshGroup.add(label);
            break;
          }
          case 'bank': {
            const body = new THREE.Mesh(
              new THREE.BoxGeometry(0.98, 3.2, 0.98),
              new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.95, roughness: 0.05 })
            );
            body.position.y = 1.6 - 0.1;
            body.castShadow = true;
            meshGroup.add(body);

            const label = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0x3b82f6 }));
            label.position.set(0, 3.4, 0);
            meshGroup.add(label);
            break;
          }
          case 'shop': {
            const body = new THREE.Mesh(
              new THREE.BoxGeometry(0.98, 2.4, 0.98),
              new THREE.MeshStandardMaterial({ color: 0x9a3412, metalness: 0.5, roughness: 0.4 })
            );
            body.position.y = 1.2 - 0.1;
            body.castShadow = true;
            meshGroup.add(body);

            const label = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xeab308 }));
            label.position.set(0, 2.7, 0);
            meshGroup.add(label);
            break;
          }
          case 'tree': {
            const trunk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.1, 0.12, 0.8),
              new THREE.MeshStandardMaterial({ color: 0x3e2723 })
            );
            trunk.position.y = 0.4;
            meshGroup.add(trunk);

            const leaves = new THREE.Mesh(
              new THREE.SphereGeometry(0.42, 8, 8),
              new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.85 })
            );
            leaves.position.y = 0.95;
            leaves.castShadow = true;
            meshGroup.add(leaves);
            break;
          }
        }

        meshGroup.position.set(b.x, b.y, b.z);
        meshGroup.userData = { type: b.type, id: idx, key };
        scene.add(meshGroup);
        blocksMeshesRef.current[key] = meshGroup;
      });

      carPosVec.current.copy(carSpawnPos);
      if (carModelRef.current) {
        carModelRef.current.position.copy(carSpawnPos);
      }
    };

    renderCityBlocks();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!mountRef.current || !renderer || !camera) return;
      for (let entry of entries) {
        const width = entry.contentRect.width || mountRef.current.clientWidth;
        const height = entry.contentRect.height || mountRef.current.clientHeight;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (mountRef.current) resizeObserver.unobserve(mountRef.current);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      Object.values(blocksMeshesRef.current).forEach(m => scene.remove(m));
    };
  }, [blocks]);

  // Click on canvas to draw
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying || !sceneRef.current || !cameraRef.current || !rendererRef.current || !mountRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / mountRef.current.clientWidth) * 2 - 1;
    const y = -((event.clientY - rect.top) / mountRef.current.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const meshes: THREE.Object3D[] = [];
    Object.values(blocksMeshesRef.current).forEach(g => {
      g.children.forEach(c => meshes.push(c));
    });

    const intersects = raycaster.intersectObjects(meshes);

    if (eraserMode) {
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData.key) {
          obj = obj.parent;
        }
        if (obj) {
          const key = obj.userData.key;
          setBlocks(prev => prev.filter(b => `${b.x},${b.y},${b.z}` !== key));
        }
      }
    } else {
      let targetPos = new THREE.Vector3();
      
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData.key) {
          obj = obj.parent;
        }
        if (obj) {
          const normal = intersects[0].face?.normal;
          if (normal) {
            targetPos.copy(obj.position).add(normal.clone().round());
          }
        }
      } else {
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, intersectPoint)) {
          targetPos.copy(intersectPoint).round();
        } else {
          return;
        }
      }

      const snapX = Math.max(-16, Math.min(16, Math.round(targetPos.x))); // Extended bounds
      const snapY = 0;
      const snapZ = Math.max(-16, Math.min(16, Math.round(targetPos.z)));

      let updatedBlocks = [...blocks];
      if (selectedBlock === 'car') {
        updatedBlocks = updatedBlocks.filter(b => b.type !== 'car');
      }

      const existsIdx = updatedBlocks.findIndex(b => b.x === snapX && b.y === snapY && b.z === snapZ);
      if (existsIdx === -1) {
        const newBlock: BlockData = { x: snapX, y: snapY, z: snapZ, type: selectedBlock };
        setBlocks([...updatedBlocks, newBlock]);
      }
    }
  };

  // Play Mode Game Logic with Drifting & Particles
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !renderer || !controls) return;

    if (!isPlaying) {
      citySynth.stopEngine();
      if (playerGroupRef.current) {
        scene.remove(playerGroupRef.current);
        playerGroupRef.current = null;
      }
      if (carModelRef.current) {
        scene.remove(carModelRef.current);
        carModelRef.current = null;
      }
      // Clean remaining smoke particles
      smokeParticles.current.forEach(p => scene.remove(p.mesh));
      smokeParticles.current = [];
      return;
    }

    // 1. Spawning GTA sports car (Premium Metallic Clearcoat material)
    const carGroup = new THREE.Group();
    
    // Chassis paint
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.22, 1.4),
      new THREE.MeshPhysicalMaterial({ 
        color: 0xef4444, 
        metalness: 0.95, 
        roughness: 0.05, 
        clearcoat: 1.0, 
        clearcoatRoughness: 0.02 
      })
    );
    chassis.position.y = 0.12;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    carGroup.add(chassis);

    // Cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.22, 0.68),
      new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.95, roughness: 0.05, transparent: true, opacity: 0.85 })
    );
    cabin.position.set(0, 0.3, -0.05);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Glowing front headlights
    const lightGeom = new THREE.SphereGeometry(0.06, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlightL = new THREE.Mesh(lightGeom, lightMat);
    headlightL.position.set(-0.3, 0.14, 0.71);
    const headlightR = new THREE.Mesh(lightGeom, lightMat);
    headlightR.position.set(0.3, 0.14, 0.71);
    carGroup.add(headlightL);
    carGroup.add(headlightR);

    // Headlight Beam
    const spotLight = new THREE.SpotLight(0xfffae8, 9, 12, Math.PI / 4, 0.6, 1);
    spotLight.position.set(0, 0.18, 0.71);
    spotLight.target.position.set(0, 0.05, 9);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    carGroup.add(spotLight);
    carGroup.add(spotLight.target);

    // Glowing tail lights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const tailLightL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), tailMat);
    tailLightL.position.set(-0.3, 0.15, -0.71);
    const tailLightR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), tailMat);
    tailLightR.position.set(0.3, 0.15, -0.71);
    carGroup.add(tailLightL);
    carGroup.add(tailLightR);

    // 4 Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.15, 12);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090c, roughness: 0.95 });
    
    const wheelFL = new THREE.Mesh(wheelGeom, wheelMat); wheelFL.position.set(-0.45, 0.09, 0.45);
    const wheelFR = new THREE.Mesh(wheelGeom, wheelMat); wheelFR.position.set(0.45, 0.09, 0.45);
    const wheelBL = new THREE.Mesh(wheelGeom, wheelMat); wheelBL.position.set(-0.45, 0.09, -0.45);
    const wheelBR = new THREE.Mesh(wheelGeom, wheelMat); wheelBR.position.set(0.45, 0.09, -0.45);
    
    carGroup.add(wheelFL); carGroup.add(wheelFR); carGroup.add(wheelBL); carGroup.add(wheelBR);

    const blockCar = blocks.find(b => b.type === 'car') || { x: 0, y: 0, z: 0 };
    carPosVec.current.set(blockCar.x, 0.18, blockCar.z);
    carGroup.position.copy(carPosVec.current);
    scene.add(carGroup);
    carModelRef.current = carGroup;

    // 2. Spawning Player on foot
    const playerGroup = new THREE.Group();
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.6, 0.28), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.5 }));
    pBody.position.y = 0.3;
    pBody.castShadow = true;
    playerGroup.add(pBody);

    const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfecdd3 }));
    pHead.position.y = 0.7;
    pHead.castShadow = true;
    playerGroup.add(pHead);

    playerPosVec.current.set(blockCar.x + 1.4, 0.4, blockCar.z + 1.4);
    playerGroup.position.copy(playerPosVec.current);
    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    carAngle.current = 0;
    carVelocity.current = 0;
    driftAngle.current = 0;
    driftTimer.current = 0;

    let lastTime = performance.now();

    // 3. Physics & Visual Emitters Loop
    const playLoop = () => {
      const time = performance.now();
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const solidBlocks = blocks.filter(b => b.type !== 'road' && b.type !== 'sidewalk' && b.type !== 'car');

      // Update engine sound
      if (isDriving) {
        citySynth.updateEnginePitch(carVelocity.current, 18.0);
      }

      // Update tire smoke particles
      smokeParticles.current.forEach((p, idx) => {
        p.age += 1;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mesh.scale.multiplyScalar(0.94); // Shrink
        (p.mesh.material as THREE.Material).opacity = 1 - (p.age / p.maxAge);
        
        if (p.age >= p.maxAge) {
          scene.remove(p.mesh);
          smokeParticles.current.splice(idx, 1);
        }
      });

      if (isDriving) {
        // --- A. VEHICLE DRIFTING PHYSICS ---
        const maxSpeed = 17.5; // Upgraded speed
        const accel = 15.0;     // Higher acceleration
        const drag = 3.2;
        let turnSpeed = 2.8;

        const isDriftingInput = keysRef.current['Space'];

        if (isDriftingInput && Math.abs(carVelocity.current) > 3.0) {
          // Slide drift modifier
          turnSpeed = 4.2; // Sharper angle turn during drift
          setIsDriftingVisual(true);
          
          // Accumulate drift time
          driftTimer.current += dt;
          setDriftSlideTime(prev => Number((prev + dt).toFixed(2)));
          
          // Sound synth screech
          citySynth.startScreech();
          citySynth.updateScreechPitch(Math.abs(carVelocity.current));

          // Spawn tire smoke particles at rear tire coordinates
          if (Math.random() < 0.45) {
            const smokeGeom = new THREE.DodecahedronGeometry(0.12);
            const smokeMat = new THREE.MeshBasicMaterial({ 
              color: 0x94a3b8, // Gray smoke
              transparent: true, 
              opacity: 0.65 
            });
            const smokeMesh = new THREE.Mesh(smokeGeom, smokeMat);
            
            // Set behind rear wheels
            const rearLeftOffset = new THREE.Vector3(-0.45, 0.08, -0.45).applyAxisAngle(new THREE.Vector3(0, 1, 0), carAngle.current);
            smokeMesh.position.copy(carPosVec.current).add(rearLeftOffset);
            
            scene.add(smokeMesh);
            smokeParticles.current.push({
              mesh: smokeMesh,
              vel: new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5 + 0.5, -Math.sin(carAngle.current) * 2),
              age: 0,
              maxAge: 30
            });
          }
        } else {
          setIsDriftingVisual(false);
          setDriftSlideTime(0);
          driftTimer.current = 0;
          citySynth.stopScreech();
        }

        // Steer angle controls
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) {
          carAngle.current += turnSpeed * dt;
        }
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) {
          carAngle.current -= turnSpeed * dt;
        }

        // Drive controls
        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) {
          carVelocity.current += accel * dt;
        } else if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) {
          carVelocity.current -= accel * dt;
        } else {
          // Slow coasting drag
          if (carVelocity.current > 0) {
            carVelocity.current = Math.max(0, carVelocity.current - drag * dt);
          } else {
            carVelocity.current = Math.min(0, carVelocity.current + drag * dt);
          }
        }

        carVelocity.current = Math.max(-maxSpeed * 0.4, Math.min(maxSpeed, carVelocity.current));

        // Calculate translation vectors (incorporating drift slip slide angles)
        const slipRatio = isDriftingInput ? 0.35 : 0.05;
        driftAngle.current = THREE.MathUtils.lerp(driftAngle.current, carAngle.current, 1 - slipRatio);
        
        const dx = Math.sin(driftAngle.current) * carVelocity.current * dt;
        const dz = Math.cos(driftAngle.current) * carVelocity.current * dt;
        const nextPos = carPosVec.current.clone().add(new THREE.Vector3(dx, 0, dz));

        // Circular collision check
        let collided = false;
        const carRad = 0.6;
        
        solidBlocks.forEach(b => {
          const size = b.type === 'tree' ? 0.65 : 1.0;
          const minX = b.x - size/2;
          const maxX = b.x + size/2;
          const minZ = b.z - size/2;
          const maxZ = b.z + size/2;

          const cx = Math.max(minX, Math.min(nextPos.x, maxX));
          const cz = Math.max(minZ, Math.min(nextPos.z, maxZ));

          const distSq = (nextPos.x - cx) ** 2 + (nextPos.z - cz) ** 2;
          if (distSq < carRad * carRad) collided = true;
        });

        // Map bounds (Extended 32x32 city grid)
        if (nextPos.x < -16 || nextPos.x > 16 || nextPos.z < -16 || nextPos.z > 16) {
          collided = true;
        }

        if (collided) {
          citySynth.playCrash();
          carVelocity.current = -carVelocity.current * 0.38; // Bounce reverse
        } else {
          carPosVec.current.copy(nextPos);
        }

        carGroup.position.copy(carPosVec.current);
        carGroup.rotation.y = carAngle.current;

        // Visual spin tires
        const wRot = carVelocity.current * 0.35;
        wheelFL.rotation.x += wRot; wheelFR.rotation.x += wRot;
        wheelBL.rotation.x += wRot; wheelBR.rotation.x += wRot;

        // Camera follow
        const cDist = 4.8;
        const cHeight = 2.3;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, carPosVec.current.x - Math.sin(carAngle.current) * cDist, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, carPosVec.current.z - Math.cos(carAngle.current) * cDist, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, carPosVec.current.y + cHeight, 0.08);
        controls.target.copy(carPosVec.current);
      } else {
        // --- B. PEDESTRIAN AVATAR WALKING ---
        const wSpeed = 4.0;
        let walkDx = 0;
        let walkDz = 0;

        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) walkDz -= 1;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) walkDz += 1;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) walkDx -= 1;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) walkDx += 1;

        if (walkDx !== 0 || walkDz !== 0) {
          const mDir = new THREE.Vector3(walkDx, 0, walkDz).normalize().multiplyScalar(wSpeed * dt);
          const nextP = playerPosVec.current.clone().add(mDir);

          let pCollided = false;
          const pRad = 0.28;

          solidBlocks.forEach(b => {
            const size = b.type === 'tree' ? 0.65 : 1.0;
            const minX = b.x - size/2;
            const maxX = b.x + size/2;
            const minZ = b.z - size/2;
            const maxZ = b.z + size/2;

            const cx = Math.max(minX, Math.min(nextP.x, maxX));
            const cz = Math.max(minZ, Math.min(nextP.z, maxZ));

            const distSq = (nextP.x - cx) ** 2 + (nextP.z - cz) ** 2;
            if (distSq < pRad * pRad) pCollided = true;
          });

          if (nextP.x < -16 || nextP.x > 16 || nextP.z < -16 || nextP.z > 16) {
            pCollided = true;
          }

          if (!pCollided) playerPosVec.current.copy(nextP);

          playerGroup.rotation.y = Math.atan2(walkDx, walkDz);
          pHead.position.y = 0.7 + Math.sin(time * 0.015) * 0.02;
        }

        playerGroup.position.copy(playerPosVec.current);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerPosVec.current.x, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, playerPosVec.current.z + 4.8, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, playerPosVec.current.y + 3.0, 0.08);
        controls.target.copy(playerPosVec.current);
      }

      // --- C. RADAR MINI-MAP RENDERER ---
      const radarCanvas = radarCanvasRef.current;
      if (radarCanvas) {
        const ctx = radarCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#06060c';
          ctx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
          
          ctx.strokeStyle = '#f43f5e'; // GTA Reddish neon border
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(radarCanvas.width/2, radarCanvas.height/2, radarCanvas.width/2 - 2, 0, Math.PI * 2);
          ctx.stroke();

          const centerPos = isDriving ? carPosVec.current : playerPosVec.current;
          
          // Radar zooms in/out dynamically depending on speedometer speed!
          const speedZoomRatio = 1 + (Math.abs(carVelocity.current) / 17.5) * 0.8;
          const radarScale = 5.6 / speedZoomRatio; // Auto-scaling zoom

          // Draw Roads
          ctx.fillStyle = '#1f2937';
          blocks.forEach(b => {
            if (b.type === 'road') {
              const rx = radarCanvas.width/2 + (b.x - centerPos.x) * radarScale;
              const rz = radarCanvas.height/2 + (b.z - centerPos.z) * radarScale;
              ctx.fillRect(rx - radarScale/2, rz - radarScale/2, radarScale + 0.6, radarScale + 0.6);
            }
          });

          // Draw Skyscrapers
          blocks.forEach(b => {
            if (b.type === 'skyscraper') {
              ctx.fillStyle = '#111827';
              const rx = radarCanvas.width/2 + (b.x - centerPos.x) * radarScale;
              const rz = radarCanvas.height/2 + (b.z - centerPos.z) * radarScale;
              ctx.fillRect(rx - radarScale/2, rz - radarScale/2, radarScale, radarScale);
              ctx.strokeStyle = '#4b5563';
              ctx.strokeRect(rx - radarScale/2, rz - radarScale/2, radarScale, radarScale);
            }
          });

          // Target markers (Office, Bank, Shop)
          blocks.forEach(b => {
            let color = '';
            if (b.type === 'office') color = '#10b981'; // Green
            if (b.type === 'bank') color = '#3b82f6';   // Blue
            if (b.type === 'shop') color = '#eab308';   // Yellow

            if (color) {
              const rx = radarCanvas.width/2 + (b.x - centerPos.x) * radarScale;
              const rz = radarCanvas.height/2 + (b.z - centerPos.z) * radarScale;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(rx, rz, 4.5, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Car indicator
          if (!isDriving && carModelRef.current) {
            ctx.fillStyle = '#ef4444';
            const cx = radarCanvas.width/2 + (carPosVec.current.x - centerPos.x) * radarScale;
            const cz = radarCanvas.height/2 + (carPosVec.current.z - centerPos.z) * radarScale;
            ctx.fillRect(cx - 3.5, cz - 3.5, 7, 7);
          }

          // Player indicator
          ctx.fillStyle = isDriving ? '#ef4444' : '#fbbf24';
          ctx.beginPath();
          ctx.arc(radarCanvas.width/2, radarCanvas.height/2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- D. MISSION BEACON CHECK & HUD APPOINTMENTS COMPASS ---
      const activePosition = isDriving ? carPosVec.current : playerPosVec.current;
      
      // Look up target landmarks
      let nearestDist = Infinity;
      let targetDx = 0;
      let targetDz = 0;
      let nearestQuest: CityTask | undefined;

      // Find the first uncompleted task
      const firstActiveTask = tasks.find(t => !t.targetCompleted);
      if (firstActiveTask) {
        setActiveQuestTitle(firstActiveTask.title);
        
        // Find corresponding building coordinates
        const targetBlock = blocks.find(b => b.type === firstActiveTask.type);
        if (targetBlock) {
          targetDx = targetBlock.x - activePosition.x;
          targetDz = targetBlock.z - activePosition.z;
          nearestDist = activePosition.distanceTo(new THREE.Vector3(targetBlock.x, activePosition.y, targetBlock.z));
          nearestQuest = firstActiveTask;
        }
      } else {
        setActiveQuestTitle('All missions complete!');
      }

      // Update compass arrow angle
      if (nearestDist < Infinity) {
        setClosestTargetDist(Number(nearestDist.toFixed(1)));
        // Direct relative angle
        const lookAngle = Math.atan2(targetDx, targetDz);
        // Relative to camera/facing angle
        const camAngleY = isDriving ? carAngle.current : playerGroup.rotation.y;
        setClosestTargetAngle(lookAngle - camAngleY);
      } else {
        setClosestTargetDist(null);
      }

      // Check arrival triggers
      blocks.forEach(b => {
        if (b.type === 'office' || b.type === 'bank' || b.type === 'shop') {
          const dist = activePosition.distanceTo(new THREE.Vector3(b.x, activePosition.y, b.z));
          if (dist < 1.4) {
            setTasks(prev => {
              let updated = false;
              const next = prev.map(t => {
                if (t.type === b.type && !t.targetCompleted) {
                  updated = true;
                  t.targetCompleted = true;
                  onRewardXP(t.xpReward);
                  citySynth.playTaskComplete();
                  
                  setVictoryXP(t.xpReward);
                  setVictoryTitle(t.title);
                  setShowVictoryScreen(true);
                }
                return t;
              });

              // Check Achievement: City Navigator (visit all 3)
              if (updated) {
                const allDone = next.every(x => x.targetCompleted);
                if (allDone) {
                  unlockAchievement('ach_tour');
                }
              }

              return next;
            });
          }
        }
      });

      // --- E. ACHIEVEMENT TRIGGERS ---
      // 1. Speed Demon (Reach 80 km/h)
      const currentSpeedKMH = Math.round(Math.abs(carVelocity.current) * 8.5);
      if (currentSpeedKMH >= 80) {
        unlockAchievement('ach_speed');
      }

      // 2. Drift King (Drift continuously for 1.5s)
      if (driftTimer.current >= 1.5) {
        unlockAchievement('ach_drift');
      }

      // Speed speedometer
      setCarSpeed(currentSpeedKMH);

      controls.update();
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(playLoop);
    };

    requestRef.current = requestAnimationFrame(playLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isDriving, blocks, tasks]);

  // Unlock achievement helper
  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
      let updated = false;
      const next = prev.map(a => {
        if (a.id === id && !a.unlocked) {
          updated = true;
          a.unlocked = true;
          onRewardXP(a.xpVal);
          citySynth.playTaskComplete();
        }
        return a;
      });
      return next;
    });
  };

  // Touch control helper
  const handleTouchDown = (key: string) => {
    keysRef.current[key] = true;
  };
  const handleTouchUp = (key: string) => {
    keysRef.current[key] = false;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#05050b] text-white rounded-2xl overflow-hidden border border-white/10 relative">
      
      {/* LEFT PANEL: 3D GAMING CANVAS VIEW */}
      <div className="flex-1 flex flex-col relative h-[520px] lg:h-auto min-h-[500px]">
        
        {/* Top Header Navigation */}
        <div className="absolute top-0 inset-x-0 p-4 bg-black/75 backdrop-blur-md border-b border-white/10 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌆</span>
              <h2 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500 uppercase font-mono">
                TechSetu GTA Task City 🚗
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {isPlaying 
                ? `Active Mission: ${activeQuestTitle}`
                : "Editor Mode: Build roads, sidewalks, Skyscrapers with lit window grids, and beacons."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={saveCity}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                  title="Save current layout to Memory"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Map</span>
                </button>
                <button
                  onClick={clearCity}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                  title="Clear all objects"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Map</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleCarDriving}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>{isDriving ? "Exit Vehicle (F)" : "Enter Vehicle (F)"}</span>
                </button>
                
                {isDriving && (
                  <button
                    onClick={() => citySynth.playHorn()}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                  >
                    📢 Horn
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                setIsDriving(false);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                isPlaying 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-orange-500 hover:brightness-110 text-white shadow-md shadow-red-500/15'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Edit Map</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play City</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3D Canvas mount point */}
        <div 
          ref={mountRef} 
          onClick={handleCanvasClick}
          className="flex-1 w-full cursor-pointer bg-[#05050a]"
        />

        {/* HUD: circular radar mini-map (Only in Play Mode) */}
        {isPlaying && (
          <div className="absolute bottom-6 left-6 w-28 h-28 rounded-full border-2 border-slate-700 overflow-hidden shadow-2xl z-10 bg-black">
            <canvas ref={radarCanvasRef} width={112} height={112} className="w-full h-full" />
          </div>
        )}

        {/* HUD: speedometer and drift details (Only when driving) */}
        {isPlaying && isDriving && (
          <div className="absolute bottom-6 right-6 p-4.5 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl z-10 min-w-[150px] font-mono shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">SPEEDOMETER</span>
            
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 tracking-tighter">
                {carSpeed}
              </span>
              <span className="text-[10px] text-slate-300">KM/H</span>
            </div>

            {/* Custom Drift sliding indicator gauge */}
            {isDriftingVisual && (
              <div className="mt-2 text-[9.5px] font-bold text-pink-400 flex items-center justify-between animate-pulse">
                <span>SLIP ANGLE DRIFT</span>
                <span>{driftSlideTime}s</span>
              </div>
            )}
          </div>
        )}

        {/* HUD: Relative mission direction compass pointer (Only in Play Mode) */}
        {isPlaying && closestTargetDist !== null && (
          <div className="absolute top-24 left-6 bg-black/75 backdrop-blur-md border border-white/10 p-3 rounded-2xl z-10 flex items-center gap-3 font-mono">
            <div 
              className="w-8 h-8 rounded-full border border-orange-500/50 flex items-center justify-center transition-all bg-black/40"
              style={{ transform: `rotate(${closestTargetAngle}rad)` }}
            >
              <Compass className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-[10.5px] leading-tight">
              <span className="text-slate-400 uppercase font-black text-[8px] block">Next Beacon</span>
              <span className="text-white font-bold">{closestTargetDist}m</span>
            </div>
          </div>
        )}

        {/* Editor block brush palette (Only in Editor Mode) */}
        {!isPlaying && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-3 bg-black/85 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3.5 z-10 max-w-[90%] overflow-x-auto">
            <div className="text-[10px] uppercase font-bold text-slate-400 border-r border-white/10 pr-3 shrink-0 select-none">
              🏙️ City Blocks
            </div>

            <div className="flex items-center gap-2">
              {[
                { type: 'road', emoji: '🛣️', name: 'Asphalt Road' },
                { type: 'sidewalk', emoji: '🚶', name: 'Concrete Walkway' },
                { type: 'skyscraper', emoji: '🏢', name: 'Glass Skyscraper' },
                { type: 'office', emoji: '💼', name: 'Office HQ' },
                { type: 'bank', emoji: '🏦', name: 'Maze Bank ATM' },
                { type: 'shop', emoji: '🛒', name: 'Supermarket' },
                { type: 'tree', emoji: '🌳', name: 'City Park Tree' },
                { type: 'car', emoji: '🚗', name: 'Spawn Sports Car' },
              ].map(item => (
                <button
                  key={item.type}
                  onClick={() => {
                    setSelectedBlock(item.type as BlockType);
                    setEraserMode(false);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[55px] border transition-all cursor-pointer ${
                    selectedBlock === item.type && !eraserMode
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 scale-105 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                  title={item.name}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-[7.5px] font-bold select-none">{item.type}</span>
                </button>
              ))}

              <div className="w-[1px] h-8 bg-white/10 mx-1 shrink-0" />

              <button
                onClick={() => setEraserMode(true)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[55px] border transition-all cursor-pointer ${
                  eraserMode
                    ? 'bg-red-500/25 border-red-500 text-red-300 scale-105'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title="Erase blocks"
              >
                <span className="text-lg">❌</span>
                <span className="text-[7.5px] font-bold select-none">Eraser</span>
              </button>
            </div>
          </div>
        )}

        {/* GTA Play Control pedals overlay (Only in Play Mode) */}
        {isPlaying && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-between gap-12 pointer-events-none z-10">
            <div className="flex gap-2 bg-black/60 p-2 rounded-xl border border-white/5 pointer-events-auto">
              <button
                onMouseDown={() => handleTouchDown('KeyA')}
                onMouseUp={() => handleTouchUp('KeyA')}
                onTouchStart={() => handleTouchDown('KeyA')}
                onTouchEnd={() => handleTouchUp('KeyA')}
                className="w-10 h-10 bg-white/10 active:bg-orange-500 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onMouseDown={() => handleTouchDown('KeyD')}
                onMouseUp={() => handleTouchUp('KeyD')}
                onTouchStart={() => handleTouchDown('KeyD')}
                onTouchEnd={() => handleTouchUp('KeyD')}
                className="w-10 h-10 bg-white/10 active:bg-orange-500 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 bg-black/60 p-2 rounded-xl border border-white/5 pointer-events-auto">
              <button
                onMouseDown={() => handleTouchDown('KeyS')}
                onMouseUp={() => handleTouchUp('KeyS')}
                onTouchStart={() => handleTouchDown('KeyS')}
                onTouchEnd={() => handleTouchUp('KeyS')}
                className="w-10 h-10 bg-white/10 active:bg-red-500 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onMouseDown={() => handleTouchDown('KeyW')}
                onMouseUp={() => handleTouchUp('KeyW')}
                onTouchStart={() => handleTouchDown('KeyW')}
                onTouchEnd={() => handleTouchUp('KeyW')}
                className="w-12 h-10 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <ArrowUp className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Drift Pedal Space (Right side) */}
            {isDriving && (
              <div className="bg-black/60 p-2 rounded-xl border border-white/5 pointer-events-auto">
                <button
                  onMouseDown={() => handleTouchDown('Space')}
                  onMouseUp={() => handleTouchUp('Space')}
                  onTouchStart={() => handleTouchDown('Space')}
                  onTouchEnd={() => handleTouchUp('Space')}
                  className="w-16 h-10 bg-pink-600 active:bg-pink-700 text-white font-mono text-[9px] font-black uppercase rounded-lg flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>DRIFT</span>
                  <span className="text-[7px] opacity-70">SPACE</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* RIGHT SIDEBAR: GTA GAMEPLATFORM MISSIONS & ACHIEVEMENTS */}
      <div className="w-full lg:w-80 bg-gradient-to-b from-[#0a0a12] to-[#050508] border-t lg:border-t-0 lg:border-l border-white/10 p-5 flex flex-col justify-between space-y-6">
        
        <div className="space-y-5">
          <div className="pb-3 border-b border-white/5 space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>City Task Planner 📝</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              Create and map tasks to city landmarks, then drive to complete them!
            </p>
          </div>

          {/* Active Missions */}
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
            {tasks.map(t => (
              <div 
                key={t.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  t.targetCompleted 
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-65'
                    : 'border-white/5 bg-white/2 hover:border-white/10'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`p-1.5 rounded-lg shrink-0 ${
                    t.type === 'work' ? 'bg-emerald-500/10 text-emerald-400' :
                    t.type === 'bank' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {t.type === 'work' ? <Briefcase className="w-3.5 h-3.5" /> :
                     t.type === 'bank' ? <DollarSign className="w-3.5 h-3.5" /> :
                     <ShoppingBag className="w-3.5 h-3.5" />}
                  </span>

                  <div className="min-w-0 leading-tight">
                    <span className={`text-[10.5px] font-bold block truncate ${t.targetCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                      {t.title}
                    </span>
                    <span className="text-[8.5px] text-slate-400 uppercase font-mono tracking-wider block mt-0.5">
                      Target: {t.type === 'work' ? 'Office Beacon' : t.type === 'bank' ? 'Bank ATM' : 'Supermarket'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {t.targetCompleted ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black font-mono">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-orange-400 font-mono">
                      +{t.xpReward} XP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* New mission scheduler */}
          <form onSubmit={handleAddTask} className="p-3.5 bg-black/45 border border-white/5 rounded-xl space-y-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
              Schedule New Mission
            </span>
            
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Deliver PRD specs..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all font-mono"
            />

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <span className="text-[8px] text-slate-400 block font-mono">Select Destination</span>
                <select
                  value={newTaskType}
                  onChange={e => setNewTaskType(e.target.value as any)}
                  className="w-full bg-[#0a0a14] border border-white/10 rounded-lg p-1.5 text-[10px] text-white focus:outline-none cursor-pointer"
                >
                  <option value="work">Corporate Office (💼)</option>
                  <option value="bank">Maze Bank ATM (🏦)</option>
                  <option value="shop">24/7 Supermarket (🛒)</option>
                </select>
              </div>

              <button
                type="submit"
                className="self-end bg-gradient-to-r from-orange-500 to-yellow-500 hover:brightness-110 text-black font-black text-[10.5px] px-3.5 py-2 rounded-lg cursor-pointer transition-all shrink-0 font-mono"
              >
                Add Mission
              </button>
            </div>
          </form>
        </div>

        {/* Achievements Shelf */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
            Gaming Achievements 🏆
          </span>
          <div className="space-y-2 max-h-[160px] overflow-y-auto">
            {achievements.map(ach => (
              <div 
                key={ach.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                  ach.unlocked 
                    ? 'border-pink-500/25 bg-pink-500/5' 
                    : 'border-white/5 bg-black/25 opacity-50'
                }`}
              >
                <div className="min-w-0 leading-tight">
                  <span className="text-[10px] font-bold text-white block truncate">{ach.title}</span>
                  <span className="text-[8px] text-slate-400 block truncate mt-0.5">{ach.desc}</span>
                </div>
                <span className="text-[9px] font-mono text-pink-400 font-bold shrink-0">
                  +{ach.xpVal} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
            City Map Presets
          </span>
          {EXPANDED_CITY_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className={`w-full p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                activeChallengeId === preset.id
                  ? 'bg-orange-500/10 border-orange-500/60 text-white'
                  : 'bg-white/2 border-white/5 hover:bg-white/5 text-slate-300'
              }`}
            >
              <div className="text-[10.5px] font-black flex justify-between items-center w-full">
                <span>{preset.title}</span>
                <span className="text-[9px] font-mono text-emerald-400">+{preset.xpReward} XP</span>
              </div>
            </button>
          ))}
        </div>

      </div>

      {/* VICTORY OVERLAY SCREEN (GTA WAStED STYLE SUCCESS) */}
      {showVictoryScreen && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 max-w-sm relative">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-xl border border-white/20">
              <Trophy className="w-8 h-8 text-black" />
            </div>

            <div className="space-y-2 font-mono">
              <h1 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 tracking-wider">
                MISSION PASSED
              </h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-black text-white">
                {victoryTitle}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 max-w-[240px] mx-auto text-center font-mono">
              <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">XP Rewarded</span>
              <span className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                +{victoryXP} XP
              </span>
            </div>

            <button
              onClick={() => setShowVictoryScreen(false)}
              className="px-6 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold rounded-xl transition-all cursor-pointer uppercase tracking-widest font-mono"
            >
              Continue Driving
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
