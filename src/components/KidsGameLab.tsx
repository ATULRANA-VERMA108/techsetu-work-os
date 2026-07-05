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
  Compass,
  Briefcase,
  ShoppingBag,
  DollarSign,
  Info
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

// GTA City Synthesized Audio System
class CityAudioSynth {
  private ctx: AudioContext | null = null;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Start continuous car engine hum
  startEngine() {
    this.initCtx();
    if (!this.ctx || this.motorOsc) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, this.ctx.currentTime); // Low idle rumble
    
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    
    this.motorOsc = osc;
    this.motorGain = gain;
  }

  // Update engine hum pitch based on speed
  updateEnginePitch(speed: number, maxSpeed: number) {
    if (!this.ctx || !this.motorOsc) return;
    const ratio = Math.abs(speed) / maxSpeed;
    const targetFreq = 45 + ratio * 140; // Pitch rises with speed
    this.motorOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
  }

  stopEngine() {
    if (this.motorOsc) {
      try {
        this.motorOsc.stop();
      } catch (e) {}
      this.motorOsc = null;
    }
    this.motorGain = null;
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
    
    // Noise buffer for explosion
    const bufferSize = this.ctx.sampleRate * 0.3;
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
    filter.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.3);
  }

  playTaskComplete() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
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

// GTA City default map templates
const CITY_CHALLENGES = [
  {
    id: 1,
    title: '🌆 Downtown Highway',
    description: 'A layout containing a complete urban highway, side walks, skyscrapers, an Office, and a Bank.',
    xpReward: 35,
    blocks: [
      // Roads
      { x: -5, y: 0, z: 0, type: 'road' },
      { x: -4, y: 0, z: 0, type: 'road' },
      { x: -3, y: 0, z: 0, type: 'road' },
      { x: -2, y: 0, z: 0, type: 'road' },
      { x: -1, y: 0, z: 0, type: 'road' },
      { x: 0, y: 0, z: 0, type: 'road' },
      { x: 1, y: 0, z: 0, type: 'road' },
      { x: 2, y: 0, z: 0, type: 'road' },
      { x: 3, y: 0, z: 0, type: 'road' },
      { x: 4, y: 0, z: 0, type: 'road' },
      { x: 5, y: 0, z: 0, type: 'road' },
      { x: 0, y: 0, z: -1, type: 'road' },
      { x: 0, y: 0, z: -2, type: 'road' },
      { x: 0, y: 0, z: -3, type: 'road' },
      { x: 0, y: 0, z: 1, type: 'road' },
      { x: 0, y: 0, z: 2, type: 'road' },
      { x: 0, y: 0, z: 3, type: 'road' },
      // Sidewalks adjacent to roads
      { x: -5, y: 0, z: 1, type: 'sidewalk' },
      { x: -4, y: 0, z: 1, type: 'sidewalk' },
      { x: -3, y: 0, z: 1, type: 'sidewalk' },
      { x: -2, y: 0, z: 1, type: 'sidewalk' },
      { x: -1, y: 0, z: 1, type: 'sidewalk' },
      { x: 1, y: 0, z: 1, type: 'sidewalk' },
      { x: 2, y: 0, z: 1, type: 'sidewalk' },
      { x: 3, y: 0, z: 1, type: 'sidewalk' },
      { x: 4, y: 0, z: 1, type: 'sidewalk' },
      { x: 5, y: 0, z: 1, type: 'sidewalk' },
      { x: -5, y: 0, z: -1, type: 'sidewalk' },
      { x: -4, y: 0, z: -1, type: 'sidewalk' },
      { x: -3, y: 0, z: -1, type: 'sidewalk' },
      { x: -2, y: 0, z: -1, type: 'sidewalk' },
      { x: -1, y: 0, z: -1, type: 'sidewalk' },
      { x: 1, y: 0, z: -1, type: 'sidewalk' },
      { x: 2, y: 0, z: -1, type: 'sidewalk' },
      { x: 3, y: 0, z: -1, type: 'sidewalk' },
      { x: 4, y: 0, z: -1, type: 'sidewalk' },
      { x: 5, y: 0, z: -1, type: 'sidewalk' },
      // Skyscrapers
      { x: -4, y: 0, z: -3, type: 'skyscraper' },
      { x: 4, y: 0, z: -3, type: 'skyscraper' },
      { x: -4, y: 0, z: 3, type: 'skyscraper' },
      { x: 4, y: 0, z: 3, type: 'skyscraper' },
      // Target Locations
      { x: -2, y: 0, z: -3, type: 'office' }, // Corporate Headquarters
      { x: 2, y: 0, z: 3, type: 'bank' },     // Maze Bank ATM
      { x: -2, y: 0, z: 3, type: 'shop' },     // 24/7 Supermarket
      // Trees
      { x: -5, y: 0, z: -2, type: 'tree' },
      { x: 5, y: 0, z: 2, type: 'tree' },
      // Sports Car Spawn
      { x: -3, y: 0, z: 0, type: 'car' }
    ] as BlockData[]
  }
];

export const KidsGameLab: React.FC<KidsGameLabProps> = ({ onRewardXP, isEasyMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // App view/edit status
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('road');
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    const saved = localStorage.getItem('techsetu-gta-city-custom');
    return saved ? JSON.parse(saved) : CITY_CHALLENGES[0].blocks;
  });
  
  // Driving states
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [carSpeed, setCarSpeed] = useState<number>(0);
  
  // Custom City Task Planner
  const [tasks, setTasks] = useState<CityTask[]>([
    { id: 't1', title: 'Deliver PRD specs to Corporate Office', type: 'work', targetCompleted: false, xpReward: 30 },
    { id: 't2', title: 'Withdraw piggybank savings from Bank ATM', type: 'bank', targetCompleted: false, xpReward: 20 },
    { id: 't3', title: 'Buy fresh food at local market shop', type: 'shop', targetCompleted: false, xpReward: 25 }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'work' | 'shop' | 'bank'>('work');
  
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(1);
  const [showVictoryScreen, setShowVictoryScreen] = useState<boolean>(false);
  const [victoryXP, setVictoryXP] = useState<number>(0);
  const [victoryTitle, setVictoryTitle] = useState<string>('');

  // ThreeJS References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number | null>(null);
  const blocksMeshesRef = useRef<{ [key: string]: THREE.Mesh | THREE.Group }>({});
  
  // Entity positions & physical models
  const playerGroupRef = useRef<THREE.Group | null>(null);
  const carModelRef = useRef<THREE.Group | null>(null);
  const frontLightsRef = useRef<THREE.SpotLight | null>(null);
  
  // Physics Vectors
  const playerPosVec = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 2));
  const carPosVec = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.25, 0));
  const carAngle = useRef<number>(0);
  const carVelocity = useRef<number>(0);
  
  // Keyboard tracking
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Save level
  const saveCity = () => {
    localStorage.setItem('techsetu-gta-city-custom', JSON.stringify(blocks));
    setActiveChallengeId(null);
  };

  // Clear level
  const clearCity = () => {
    setBlocks([{ x: 0, y: 0, z: 0, type: 'road' }]);
    setActiveChallengeId(null);
    setIsDriving(false);
  };

  // Load Preset layout
  const loadPreset = (id: number) => {
    const layout = CITY_CHALLENGES.find(c => c.id === id);
    if (layout) {
      setBlocks(layout.blocks);
      setActiveChallengeId(id);
      setIsPlaying(false);
      setIsDriving(false);
      setShowVictoryScreen(false);
      // Reset tasks status
      setTasks(prev => prev.map(t => ({ ...t, targetCompleted: false })));
    }
  };

  // Add a task to schedules list
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: CityTask = {
      id: 'task-' + Date.now(),
      title: newTaskTitle.trim(),
      type: newTaskType,
      targetCompleted: false,
      xpReward: Math.floor(Math.random() * 20) + 15
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && isPlaying) {
        e.preventDefault();
      }
      
      // 'F' key to Enter/Exit car
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

  // Handle entering/exiting the car
  const toggleCarDriving = () => {
    if (!carModelRef.current || !playerGroupRef.current) return;
    
    if (isDriving) {
      // Exit Car: Spawn player next to the car
      setIsDriving(false);
      citySynth.stopEngine();
      setCarSpeed(0);
      
      const carPos = carModelRef.current.position;
      // Offset position to spawn adjacent
      playerPosVec.current.set(
        carPos.x - Math.sin(carAngle.current + Math.PI/2) * 1.2,
        0.5,
        carPos.z - Math.cos(carAngle.current + Math.PI/2) * 1.2
      );
      playerGroupRef.current.position.copy(playerPosVec.current);
      playerGroupRef.current.visible = true;
    } else {
      // Enter Car: Check if player is close enough to the car
      const playerPos = playerGroupRef.current.position;
      const carPos = carModelRef.current.position;
      const dist = playerPos.distanceTo(carPos);
      
      if (dist < 2.0) {
        setIsDriving(true);
        citySynth.startEngine();
        playerGroupRef.current.visible = false;
        
        // Match camera rotation initially
        carAngle.current = carModelRef.current.rotation.y;
      }
    }
  };

  // Main 3D Canvas Editor & Renderer Setup
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0b14'); // Dark city midnight sky
    scene.fog = new THREE.FogExp2('#0b0b14', 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 20);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Stay above ground
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);

    // Moonlight
    const moonLight = new THREE.DirectionalLight(0xa5f3fc, 0.5);
    moonLight.position.set(-20, 40, -10);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    scene.add(moonLight);

    // City streetlighting ambient orange glow
    const streetLight = new THREE.DirectionalLight(0xfdba74, 0.4);
    streetLight.position.set(20, 30, 20);
    scene.add(streetLight);

    // Floor Base (Dark concrete ground)
    const floorGeom = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x12121e, 
      roughness: 0.95 
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.505;
    floor.receiveShadow = true;
    scene.add(floor);

    // Build Scene Meshes from blocks data
    const buildCityMeshes = () => {
      // Clear existing
      Object.values(blocksMeshesRef.current).forEach(mesh => scene.remove(mesh));
      blocksMeshesRef.current = {};

      // Spawning variables
      let carSpawnPos = new THREE.Vector3(0, 0.25, 0);

      blocks.forEach((b, idx) => {
        const key = `${b.x},${b.y},${b.z}`;
        
        if (b.type === 'car') {
          // Record car spawn coordinates, don't build block mesh
          carSpawnPos.set(b.x, 0.25, b.z);
          return;
        }

        let geom: THREE.BufferGeometry;
        let mat: THREE.Material;
        let meshGroup = new THREE.Group();

        switch (b.type) {
          case 'road': {
            // Tarmac gray box
            geom = new THREE.BoxGeometry(0.99, 0.1, 0.99);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x1e1e24, // Asphalt dark gray
              roughness: 0.9 
            });
            const roadMesh = new THREE.Mesh(geom, mat);
            roadMesh.receiveShadow = true;
            meshGroup.add(roadMesh);

            // Add center road dashed marker line
            const lineGeom = new THREE.BoxGeometry(0.08, 0.012, 0.5);
            const lineMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Neon yellow dash
            const lineMesh = new THREE.Mesh(lineGeom, lineMat);
            lineMesh.position.set(0, 0.052, 0);
            meshGroup.add(lineMesh);
            break;
          }
          case 'sidewalk': {
            geom = new THREE.BoxGeometry(0.99, 0.18, 0.99);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x52525b, // Sidewalk concrete gray
              roughness: 0.8 
            });
            const sideMesh = new THREE.Mesh(geom, mat);
            sideMesh.receiveShadow = true;
            meshGroup.add(sideMesh);
            break;
          }
          case 'skyscraper': {
            // Tall skyscrapers (Stack of building blocks)
            const height = 4 + (idx % 3) * 2; // Dynamic variety
            geom = new THREE.BoxGeometry(0.96, height, 0.96);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x0f172a, // Deep navy glass
              metalness: 0.9,
              roughness: 0.1,
              transparent: true,
              opacity: 0.95
            });
            const tower = new THREE.Mesh(geom, mat);
            tower.position.y = height / 2 - 0.1;
            tower.castShadow = true;
            tower.receiveShadow = true;
            meshGroup.add(tower);

            // Add building crown/glowing spire
            const capGeom = new THREE.BoxGeometry(0.5, 0.4, 0.5);
            const capMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Ice blue glow
            const cap = new THREE.Mesh(capGeom, capMat);
            cap.position.set(0, height, 0);
            meshGroup.add(cap);
            break;
          }
          case 'office': {
            // Office Headquarters block (Green beacon)
            geom = new THREE.BoxGeometry(0.98, 3.5, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x064e3b, // Emerald theme
              metalness: 0.7, 
              roughness: 0.2 
            });
            const body = new THREE.Mesh(geom, mat);
            body.position.y = 1.75 - 0.1;
            body.castShadow = true;
            meshGroup.add(body);

            // Floating letter sign
            const signGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const signMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Bright green sign
            const sign = new THREE.Mesh(signGeom, signMat);
            sign.position.set(0, 3.8, 0);
            meshGroup.add(sign);
            break;
          }
          case 'bank': {
            // Maze Bank block (Blue beacon)
            geom = new THREE.BoxGeometry(0.98, 3.5, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x1e3a8a, // Corporate blue theme
              metalness: 0.8,
              roughness: 0.1
            });
            const body = new THREE.Mesh(geom, mat);
            body.position.y = 1.75 - 0.1;
            body.castShadow = true;
            meshGroup.add(body);

            // Floating sign
            const signGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const signMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 }); // Bright blue sign
            const sign = new THREE.Mesh(signGeom, signMat);
            sign.position.set(0, 3.8, 0);
            meshGroup.add(sign);
            break;
          }
          case 'shop': {
            // 24/7 Supermarket block (Yellow beacon)
            geom = new THREE.BoxGeometry(0.98, 2.5, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x78350f, // Amber brick theme
              metalness: 0.4,
              roughness: 0.6
            });
            const body = new THREE.Mesh(geom, mat);
            body.position.y = 1.25 - 0.1;
            body.castShadow = true;
            meshGroup.add(body);

            // Floating sign
            const signGeom = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const signMat = new THREE.MeshBasicMaterial({ color: 0xeab308 }); // Neon yellow sign
            const sign = new THREE.Mesh(signGeom, signMat);
            sign.position.set(0, 3.0, 0);
            meshGroup.add(sign);
            break;
          }
          case 'tree': {
            // Trunk (Cylinder)
            const trunkGeom = new THREE.CylinderGeometry(0.12, 0.15, 0.8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
            const trunk = new THREE.Mesh(trunkGeom, trunkMat);
            trunk.position.y = 0.4;
            meshGroup.add(trunk);

            // Foliage (Octahedron / Sphere)
            const leavesGeom = new THREE.SphereGeometry(0.45, 8, 8);
            const leavesMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
            const leaves = new THREE.Mesh(leavesGeom, leavesMat);
            leaves.position.y = 1.0;
            leaves.castShadow = true;
            meshGroup.add(leaves);
            break;
          }
        }

        meshGroup.position.set(b.x, b.y, b.z);
        // Custom tags
        meshGroup.userData = { type: b.type, id: idx, key };

        scene.add(meshGroup);
        blocksMeshesRef.current[key] = meshGroup as any; // Cast for cleanup
      });

      // Synchronize vehicle spawn pos
      carPosVec.current.copy(carSpawnPos);
      if (carModelRef.current) {
        carModelRef.current.position.copy(carSpawnPos);
      }
    };

    buildCityMeshes();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      Object.values(blocksMeshesRef.current).forEach(mesh => scene.remove(mesh));
    };
  }, [blocks]);

  // Click on canvas to build grid blocks
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
        // Find top level group key
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

      const snapX = Math.max(-8, Math.min(8, Math.round(targetPos.x)));
      const snapY = 0; // Lock to city floor plane
      const snapZ = Math.max(-8, Math.min(8, Math.round(targetPos.z)));

      // If sports car is selected, remove any existing car blocks
      let updatedBlocks = [...blocks];
      if (selectedBlock === 'car') {
        updatedBlocks = updatedBlocks.filter(b => b.type !== 'car');
      }

      // Check duplicate coordinate
      const existsIdx = updatedBlocks.findIndex(b => b.x === snapX && b.y === snapY && b.z === snapZ);
      if (existsIdx === -1) {
        const newBlock: BlockData = { x: snapX, y: snapY, z: snapZ, type: selectedBlock };
        setBlocks([...updatedBlocks, newBlock]);
      }
    }
  };

  // Play Mode Game Logic & Radar Update Loop
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !renderer || !controls) return;

    if (!isPlaying) {
      citySynth.stopEngine();
      
      // Clean player avatar
      if (playerGroupRef.current) {
        scene.remove(playerGroupRef.current);
        playerGroupRef.current = null;
      }
      // Clean sports car
      if (carModelRef.current) {
        scene.remove(carModelRef.current);
        carModelRef.current = null;
      }
      return;
    }

    // 1. Spawning GTA sports car (Sleek red boxy model with spinning wheels)
    const carGroup = new THREE.Group();
    
    // Chassis box (Main red body)
    const chassisGeom = new THREE.BoxGeometry(0.85, 0.22, 1.4);
    const chassisMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444, // GTA Sports Red
      roughness: 0.1, 
      metalness: 0.8 
    });
    const chassis = new THREE.Mesh(chassisGeom, chassisMat);
    chassis.position.y = 0.12;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    carGroup.add(chassis);

    // Car Roof / Cabin (Dark tinted glass)
    const cabinGeom = new THREE.BoxGeometry(0.7, 0.22, 0.7);
    const cabinMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.05, 
      metalness: 0.95,
      transparent: true,
      opacity: 0.9
    });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(0, 0.3, -0.05);
    cabin.castShadow = true;
    carGroup.add(cabin);

    // Add glowing front headlights
    const lightGeom = new THREE.SphereGeometry(0.06, 8, 8);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const headlightL = new THREE.Mesh(lightGeom, lightMat);
    headlightL.position.set(-0.3, 0.15, 0.71);
    const headlightR = new THREE.Mesh(lightGeom, lightMat);
    headlightR.position.set(0.3, 0.15, 0.71);
    carGroup.add(headlightL);
    carGroup.add(headlightR);

    // Add actual lighting beams projecting forward!
    const spotLight = new THREE.SpotLight(0xfffbeb, 8, 8, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 0.2, 0.72);
    spotLight.target.position.set(0, 0.1, 8);
    carGroup.add(spotLight);
    carGroup.add(spotLight.target);
    frontLightsRef.current = spotLight;

    // 4 Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 12);
    wheelGeom.rotateZ(Math.PI / 2); // Orient wheels horizontally
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    
    const wheelFL = new THREE.Mesh(wheelGeom, wheelMat);
    wheelFL.position.set(-0.44, 0.09, 0.45);
    const wheelFR = new THREE.Mesh(wheelGeom, wheelMat);
    wheelFR.position.set(0.44, 0.09, 0.45);
    const wheelBL = new THREE.Mesh(wheelGeom, wheelMat);
    wheelBL.position.set(-0.44, 0.09, -0.45);
    const wheelBR = new THREE.Mesh(wheelGeom, wheelMat);
    wheelBR.position.set(0.44, 0.09, -0.45);
    
    carGroup.add(wheelFL);
    carGroup.add(wheelFR);
    carGroup.add(wheelBL);
    carGroup.add(wheelBR);

    // Spawn Car at default position
    const blockCar = blocks.find(b => b.type === 'car') || { x: 0, y: 0, z: 0 };
    carPosVec.current.set(blockCar.x, 0.18, blockCar.z);
    carGroup.position.copy(carPosVec.current);
    scene.add(carGroup);
    carModelRef.current = carGroup;

    // 2. Spawn Player Character on foot (Cute modern guy with headphones)
    const playerGroup = new THREE.Group();
    
    // Body (Cyan jacket)
    const pBodyGeom = new THREE.BoxGeometry(0.4, 0.6, 0.3);
    const pBodyMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.6 }); // Cyan jacket
    const pBody = new THREE.Mesh(pBodyGeom, pBodyMat);
    pBody.position.y = 0.3;
    pBody.castShadow = true;
    playerGroup.add(pBody);

    // Head (Peach skin)
    const pHeadGeom = new THREE.SphereGeometry(0.18, 12, 12);
    const pHeadMat = new THREE.MeshStandardMaterial({ color: 0xfecdd3, roughness: 0.8 }); // Skin peach
    const pHead = new THREE.Mesh(pHeadGeom, pHeadMat);
    pHead.position.y = 0.7;
    pHead.castShadow = true;
    playerGroup.add(pHead);

    // Cute glowing headphones
    const bandGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12, 1, true);
    bandGeom.rotateZ(Math.PI/2);
    const hpMat = new THREE.MeshBasicMaterial({ color: 0xec4899 }); // Neon pink headphones
    const band = new THREE.Mesh(bandGeom, hpMat);
    band.position.set(0, 0.74, 0);
    playerGroup.add(band);

    const earL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hpMat);
    earL.position.set(-0.19, 0.7, 0);
    const earR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), hpMat);
    earR.position.set(0.19, 0.7, 0);
    playerGroup.add(earL);
    playerGroup.add(earR);

    // Start player spawn next to road (or at 0, 0.5, 2)
    playerPosVec.current.set(blockCar.x + 1.2, 0.4, blockCar.z + 1.5);
    playerGroup.position.copy(playerPosVec.current);
    scene.add(playerGroup);
    playerGroupRef.current = playerGroup;

    // Reset physics values
    carAngle.current = 0;
    carVelocity.current = 0;
    
    let lastTime = performance.now();

    // 3. Play Mode Physics Loop
    const playLoop = () => {
      const time = performance.now();
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const solidBlocks = blocks.filter(b => b.type !== 'road' && b.type !== 'sidewalk' && b.type !== 'car');

      // ENGINE SOUND MODULATOR
      if (isDriving) {
        citySynth.updateEnginePitch(carVelocity.current, 14.5);
      }

      if (isDriving) {
        // --- A. DRIVING VEHICLE PHYSICS ---
        const maxSpeed = 14.5;
        const accel = 12.0;
        const drag = 3.5;
        const turnSpeed = 2.4;

        // Drive inputs
        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) {
          carVelocity.current += accel * dt;
        } else if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) {
          carVelocity.current -= accel * dt;
        } else {
          // Coasting drag slowing down
          if (carVelocity.current > 0) {
            carVelocity.current = Math.max(0, carVelocity.current - drag * dt);
          } else {
            carVelocity.current = Math.min(0, carVelocity.current + drag * dt);
          }
        }

        // Steer inputs (Only turn when moving)
        if (Math.abs(carVelocity.current) > 0.1) {
          const steerDirection = carVelocity.current > 0 ? 1 : -1;
          if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) {
            carAngle.current += turnSpeed * steerDirection * dt;
          }
          if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) {
            carAngle.current -= turnSpeed * steerDirection * dt;
          }
        }

        // Cap vehicle speeds
        carVelocity.current = Math.max(-maxSpeed * 0.4, Math.min(maxSpeed, carVelocity.current));

        // Proposed translation
        const dx = Math.sin(carAngle.current) * carVelocity.current * dt;
        const dz = Math.cos(carAngle.current) * carVelocity.current * dt;
        
        const nextCarPos = carPosVec.current.clone().add(new THREE.Vector3(dx, 0, dz));

        // Car collision bounds check (Circle radius 0.6)
        const carRadius = 0.6;
        let collided = false;

        solidBlocks.forEach(b => {
          // Bounding Box for building
          const size = b.type === 'tree' ? 0.65 : 1.0;
          const minX = b.x - size/2;
          const maxX = b.x + size/2;
          const minZ = b.z - size/2;
          const maxZ = b.z + size/2;

          const cx = Math.max(minX, Math.min(nextCarPos.x, maxX));
          const cz = Math.max(minZ, Math.min(nextCarPos.z, maxZ));

          const distSq = (nextCarPos.x - cx) ** 2 + (nextCarPos.z - cz) ** 2;
          if (distSq < carRadius * carRadius) {
            collided = true;
          }
        });

        // Map boundaries bounds check
        if (nextCarPos.x < -9 || nextCarPos.x > 9 || nextCarPos.z < -9 || nextCarPos.z > 9) {
          collided = true;
        }

        if (collided) {
          // Trigger crash bounce back
          citySynth.playCrash();
          carVelocity.current = -carVelocity.current * 0.35; // Bounce velocity backwards
        } else {
          // Accept movement
          carPosVec.current.copy(nextCarPos);
        }

        // Update Three.js model
        carGroup.position.copy(carPosVec.current);
        carGroup.rotation.y = carAngle.current;

        // Spin wheels visually during movement
        const rotSpeed = carVelocity.current * 0.3;
        wheelFL.rotation.x += rotSpeed;
        wheelFR.rotation.x += rotSpeed;
        wheelBL.rotation.x += rotSpeed;
        wheelBR.rotation.x += rotSpeed;

        // Visual steer angle on front wheels
        let steerY = 0;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) steerY = 0.4;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) steerY = -0.4;
        wheelFL.rotation.y = steerY;
        wheelFR.rotation.y = steerY;

        // Camera Follow Mode: Behind the car
        const camDistance = 4.8;
        const camHeight = 2.4;
        const targetCamX = carPosVec.current.x - Math.sin(carAngle.current) * camDistance;
        const targetCamZ = carPosVec.current.z - Math.cos(carAngle.current) * camDistance;
        const targetCamY = carPosVec.current.y + camHeight;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.08);
        
        controls.target.copy(carPosVec.current);
      } else {
        // --- B. WALKING ON-FOOT PHYSICS ---
        const walkSpeed = 3.6;
        let walkDx = 0;
        let walkDz = 0;

        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) walkDz -= 1;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) walkDz += 1;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) walkDx -= 1;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) walkDx += 1;

        if (walkDx !== 0 || walkDz !== 0) {
          const moveDir = new THREE.Vector3(walkDx, 0, walkDz).normalize().multiplyScalar(walkSpeed * dt);
          const nextPlayerPos = playerPosVec.current.clone().add(moveDir);

          // Player collision bounds check (Circle radius 0.28)
          const pRadius = 0.28;
          let pCollided = false;

          solidBlocks.forEach(b => {
            const size = b.type === 'tree' ? 0.65 : 1.0;
            const minX = b.x - size/2;
            const maxX = b.x + size/2;
            const minZ = b.z - size/2;
            const maxZ = b.z + size/2;

            const cx = Math.max(minX, Math.min(nextPlayerPos.x, maxX));
            const cz = Math.max(minZ, Math.min(nextPlayerPos.z, maxZ));

            const distSq = (nextPlayerPos.x - cx) ** 2 + (nextPlayerPos.z - cz) ** 2;
            if (distSq < pRadius * pRadius) {
              pCollided = true;
            }
          });

          // Outer bounds
          if (nextPlayerPos.x < -9 || nextPlayerPos.x > 9 || nextPlayerPos.z < -9 || nextPlayerPos.z > 9) {
            pCollided = true;
          }

          if (!pCollided) {
            playerPosVec.current.copy(nextPlayerPos);
          }

          // Face walk direction
          const angle = Math.atan2(walkDx, walkDz);
          playerGroup.rotation.y = angle;

          // Bob head during walking
          pHead.position.y = 0.7 + Math.sin(time * 0.015) * 0.02;
        }

        // Apply Three.js position
        playerGroup.position.copy(playerPosVec.current);

        // Camera Follow Mode: behind the player
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerPosVec.current.x, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, playerPosVec.current.z + 4.8, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, playerPosVec.current.y + 3.0, 0.08);
        
        controls.target.copy(playerPosVec.current);
      }

      // --- C. REAL-TIME RADAR HUD MAP UPDATE ---
      const radarCanvas = radarCanvasRef.current;
      if (radarCanvas) {
        const ctx = radarCanvas.getContext('2d');
        if (ctx) {
          // Clear
          ctx.fillStyle = '#06060c';
          ctx.fillRect(0, 0, radarCanvas.width, radarCanvas.height);
          
          // Draw Radar Border circular glow
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(radarCanvas.width/2, radarCanvas.height/2, radarCanvas.width/2 - 2, 0, Math.PI * 2);
          ctx.stroke();

          // Radar Grid center projection: we center the map around the current active entity (player or car)
          const centerPos = isDriving ? carPosVec.current : playerPosVec.current;
          const radarScale = 5.2; // Pixels per 3D unit

          // Draw Roads on radar
          ctx.fillStyle = '#1e293b';
          blocks.forEach(b => {
            if (b.type === 'road') {
              const rx = radarCanvas.width/2 + (b.x - centerPos.x) * radarScale;
              const rz = radarCanvas.height/2 + (b.z - centerPos.z) * radarScale;
              ctx.fillRect(rx - radarScale/2, rz - radarScale/2, radarScale + 0.5, radarScale + 0.5);
            }
          });

          // Draw Skyscrapers / Buildings
          blocks.forEach(b => {
            if (b.type === 'skyscraper') {
              ctx.fillStyle = '#0f172a';
              const rx = radarCanvas.width/2 + (b.x - centerPos.x) * radarScale;
              const rz = radarCanvas.height/2 + (b.z - centerPos.z) * radarScale;
              ctx.fillRect(rx - radarScale/2, rz - radarScale/2, radarScale, radarScale);
              ctx.strokeStyle = '#475569';
              ctx.strokeRect(rx - radarScale/2, rz - radarScale/2, radarScale, radarScale);
            }
          });

          // Draw Target Objectives (Office, Bank, Shop) on radar
          blocks.forEach(b => {
            let color = '';
            if (b.type === 'office') color = '#22c55e'; // Green
            if (b.type === 'bank') color = '#3b82f6';   // Blue
            if (b.type === 'shop') color = '#eab308';   // Yellow

            if (color) {
              const rx = radarCanvas.width/2 + (b.x - centerPos.x) * radarScale;
              const rz = radarCanvas.height/2 + (b.z - centerPos.z) * radarScale;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.arc(rx, rz, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Draw Car position (if not driving)
          if (!isDriving && carModelRef.current) {
            ctx.fillStyle = '#ef4444';
            const cx = radarCanvas.width/2 + (carPosVec.current.x - centerPos.x) * radarScale;
            const cz = radarCanvas.height/2 + (carPosVec.current.z - centerPos.z) * radarScale;
            ctx.fillRect(cx - 3, cz - 3, 6, 6);
          }

          // Draw Player Icon at center
          ctx.fillStyle = isDriving ? '#ef4444' : '#fbbf24'; // Red pointer if driving, yellow if walking
          ctx.beginPath();
          ctx.arc(radarCanvas.width/2, radarCanvas.height/2, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- D. CITY MISSION TASK ARRIVAL CHECKS ---
      const currentPos = isDriving ? carPosVec.current : playerPosVec.current;
      
      // Look up target building types on coordinates
      blocks.forEach(b => {
        if (b.type === 'office' || b.type === 'bank' || b.type === 'shop') {
          const dist = currentPos.distanceTo(new THREE.Vector3(b.x, currentPos.y, b.z));
          if (dist < 1.4) {
            // Arrived at a target location. Check off any active planner task of this type
            setTasks(prev => {
              let updated = false;
              const nextTasks = prev.map(t => {
                if (t.type === b.type && !t.targetCompleted) {
                  updated = true;
                  t.targetCompleted = true;
                  
                  // Reward global XP
                  onRewardXP(t.xpReward);
                  citySynth.playTaskComplete();
                  
                  // Trigger Victory Modal overlay
                  setVictoryXP(t.xpReward);
                  setVictoryTitle(t.title);
                  setShowVictoryScreen(true);
                }
                return t;
              });
              return nextTasks;
            });
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
      
      // Update speedometer speed hook
      setCarSpeed(Math.round(Math.abs(carVelocity.current) * 8.5)); // Map unit speed to virtual km/h

      requestRef.current = requestAnimationFrame(playLoop);
    };

    requestRef.current = requestAnimationFrame(playLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isDriving, blocks]);

  // Touch control helper
  const handleTouchDown = (key: string) => {
    keysRef.current[key] = true;
  };
  const handleTouchUp = (key: string) => {
    keysRef.current[key] = false;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#07070d] text-white rounded-2xl overflow-y-auto lg:overflow-hidden border border-white/10 relative">
      
      {/* LEFT: 3D GTA CITY VIEW AREA */}
      <div className="flex-1 flex flex-col relative h-[500px] lg:h-auto min-h-[480px]">
        
        {/* Top Floating Glass Header */}
        <div className="absolute top-0 inset-x-0 p-4 bg-black/70 backdrop-blur-md border-b border-white/10 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌆</span>
              <h2 className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500 uppercase font-mono">
                TechSetu GTA Task City 🚗
              </h2>
            </div>
            <p className="text-[10.5px] text-slate-400">
              {isPlaying 
                ? "Drive streets, navigate with the radar, and arrive at destination beacons to complete tasks!"
                : "Editor Mode: Build roads, sidewalks, towering skyscrapers, banks, and grocery shops."}
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
                {/* Enter/Exit Car toggle */}
                <button
                  onClick={toggleCarDriving}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>{isDriving ? "Exit Vehicle (F)" : "Enter Vehicle (F)"}</span>
                </button>
                
                {/* Horn trigger */}
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

            {/* Play/Stop Mode */}
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

        {/* 3D Canvas rendering container */}
        <div 
          ref={mountRef} 
          onClick={handleCanvasClick}
          className="flex-1 w-full cursor-pointer"
        />

        {/* Circular GTA Mini-Map Radar (Only in Play Mode) */}
        {isPlaying && (
          <div className="absolute bottom-6 left-6 w-28 h-28 rounded-full border-2 border-slate-700 overflow-hidden shadow-2xl z-10 bg-black">
            <canvas ref={radarCanvasRef} width={112} height={112} className="w-full h-full" />
          </div>
        )}

        {/* GTA Speedometer HUD overlay (Only when driving) */}
        {isPlaying && isDriving && (
          <div className="absolute bottom-6 right-6 p-4 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl z-10 text-right min-w-[130px] font-mono leading-none">
            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Vehicle Speed</span>
            <span className="text-3xl font-black text-orange-500 tracking-tighter">
              {carSpeed}
            </span>
            <span className="text-[10px] text-slate-300 ml-1">KM/H</span>
          </div>
        )}

        {/* GTA On-screen Mobile Drive Controls (Only in Play Mode) */}
        {isPlaying && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-between gap-12 pointer-events-none z-10">
            {/* Steering Left / Right */}
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

            {/* Accel / Brake */}
            <div className="flex gap-2 bg-black/60 p-2 rounded-xl border border-white/5 pointer-events-auto">
              <button
                onMouseDown={() => handleTouchDown('KeyS')}
                onMouseUp={() => handleTouchUp('KeyS')}
                onTouchStart={() => handleTouchDown('KeyS')}
                onTouchEnd={() => handleTouchUp('KeyS')}
                className="w-10 h-10 bg-white/10 active:bg-red-500 rounded-lg flex items-center justify-center cursor-pointer"
                title="Brake / Reverse"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onMouseDown={() => handleTouchDown('KeyW')}
                onMouseUp={() => handleTouchUp('KeyW')}
                onTouchStart={() => handleTouchDown('KeyW')}
                onTouchEnd={() => handleTouchUp('KeyW')}
                className="w-12 h-10 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center cursor-pointer text-black font-black"
                title="Accelerate / Gas"
              >
                <ArrowUp className="w-5 h-5 text-white" />
              </button>
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
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 scale-105 shadow-md shadow-orange-500/10'
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

      </div>

      {/* RIGHT: REAL-TIME GTA MISSION SCHEDULER SIDEBAR */}
      <div className="w-full lg:w-80 bg-gradient-to-b from-[#0b0b14] to-[#07070b] border-t lg:border-t-0 lg:border-l border-white/10 p-5 flex flex-col justify-between space-y-6">
        
        <div className="space-y-4">
          <div className="pb-3 border-b border-white/5 space-y-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>City Task Planner 📝</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-normal">
              Schedule tasks, map them to physical city buildings, and drive to complete them!
            </p>
          </div>

          {/* Active tasks list */}
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {tasks.map(t => (
              <div 
                key={t.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
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
                      Destination: {t.type}
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

          {/* Add custom city task scheduler form */}
          <form onSubmit={handleAddTask} className="p-3 bg-black/45 border border-white/5 rounded-xl space-y-2.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
              Schedule New Mission
            </span>
            
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="e.g. Audit telemetry leaks..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
            />

            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <span className="text-[8px] text-slate-400 block font-mono">Select Destination</span>
                <select
                  value={newTaskType}
                  onChange={e => setNewTaskType(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-1.5 text-[10px] text-white focus:outline-none cursor-pointer"
                >
                  <option value="work" className="bg-[#0f0f1c]">Corporate Office (💼)</option>
                  <option value="bank" className="bg-[#0f0f1c]">Maze Bank ATM (🏦)</option>
                  <option value="shop" className="bg-[#0f0f1c]">24/7 Supermarket (🛒)</option>
                </select>
              </div>

              <button
                type="submit"
                className="self-end bg-orange-500 hover:bg-orange-600 text-black font-bold text-[10.5px] px-3.5 py-2 rounded-lg cursor-pointer transition-all shrink-0"
              >
                Add Mission
              </button>
            </div>
          </form>
        </div>

        {/* Side Panel Preset Selectors */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
            Select City Preset
          </span>
          <div className="space-y-2">
            {CITY_CHALLENGES.map(preset => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset.id)}
                className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  activeChallengeId === preset.id
                    ? 'bg-orange-500/10 border-orange-500/60 text-white shadow-inner'
                    : 'bg-white/2 border-white/5 hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="text-[10.5px] font-black flex justify-between items-center w-full">
                  <span>{preset.title}</span>
                  <span className="text-[9px] font-mono text-emerald-400">+{preset.xpReward} XP</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">{preset.description}</p>
              </button>
            ))}
          </div>
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
