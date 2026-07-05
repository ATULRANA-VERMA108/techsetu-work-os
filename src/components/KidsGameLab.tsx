import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Save, 
  FolderOpen, 
  Sparkles, 
  Trophy, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Zap, 
  Plus, 
  Undo,
  BookOpen
} from 'lucide-react';

interface KidsGameLabProps {
  onRewardXP: (amount: number) => void;
  isEasyMode: boolean;
}

type BlockType = 'grass' | 'dirt' | 'lava' | 'bounce' | 'speed' | 'star' | 'portal';

interface BlockData {
  x: number;
  y: number;
  z: number;
  type: BlockType;
}

// 8-bit Synth Audio Generator using Web Audio API
class GameSoundSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCoin() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const playNote = (freq: number, start: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(987.77, now, 0.08); // B5
    playNote(1318.51, now + 0.08, 0.22); // E6
  }

  playLava() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + 0.35);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  playBounce() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playWin() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      
      gain.gain.setValueAtTime(0.15, now + index * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.18);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.18);
    });
  }

  playBoost() {
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }
}

const synth = new GameSoundSynth();

// Challenge Levels Data
const CHALLENGES = [
  {
    id: 1,
    title: '⭐ Challenge 1: The Bumpy Bridge',
    description: 'Build a path of Grass blocks across the grid, place a portal at the end, and run to it!',
    xpReward: 25,
    blocks: [
      { x: -5, y: 0, z: 0, type: 'grass' },
      { x: -4, y: 0, z: 0, type: 'grass' },
      { x: -3, y: 0, z: 0, type: 'grass' },
      { x: -2, y: 1, z: 0, type: 'grass' },
      { x: -1, y: 1, z: 0, type: 'grass' },
      { x: 0, y: 1, z: 0, type: 'grass' },
      { x: 1, y: 0, z: 0, type: 'grass' },
      { x: 2, y: 0, z: 0, type: 'grass' },
      { x: 3, y: 0, z: 0, type: 'grass' },
      { x: 4, y: 0, z: 0, type: 'portal' }
    ] as BlockData[]
  },
  {
    id: 2,
    title: '🔥 Challenge 2: Lava Leap',
    description: 'Jump over the burning lava pit! Watch out, stepping in lava resets you to the start.',
    xpReward: 35,
    blocks: [
      { x: -6, y: 0, z: 0, type: 'grass' },
      { x: -5, y: 0, z: 0, type: 'grass' },
      { x: -4, y: 0, z: 0, type: 'grass' },
      { x: -3, y: -1, z: 0, type: 'lava' },
      { x: -2, y: -1, z: 0, type: 'lava' },
      { x: -1, y: -1, z: 0, type: 'lava' },
      { x: 0, y: 0, z: 0, type: 'grass' },
      { x: 1, y: 0, z: 0, type: 'grass' },
      { x: 2, y: 0, z: 0, type: 'grass' },
      { x: 3, y: 0, z: 0, type: 'star' },
      { x: 4, y: 0, z: 0, type: 'portal' }
    ] as BlockData[]
  },
  {
    id: 3,
    title: '🚀 Challenge 3: Trampoline High',
    description: 'Use the pink bounce pad to launch yourself up to the high platform where the portal lies!',
    xpReward: 45,
    blocks: [
      { x: -6, y: 0, z: 0, type: 'grass' },
      { x: -5, y: 0, z: 0, type: 'grass' },
      { x: -4, y: 0, z: 0, type: 'bounce' },
      { x: -3, y: -1, z: 0, type: 'lava' },
      { x: -2, y: -1, z: 0, type: 'lava' },
      { x: -1, y: 2, z: 0, type: 'grass' },
      { x: 0, y: 2, z: 0, type: 'grass' },
      { x: 1, y: 3, z: 0, type: 'grass' },
      { x: 2, y: 3, z: 0, type: 'star' },
      { x: 3, y: 3, z: 0, type: 'portal' }
    ] as BlockData[]
  },
  {
    id: 4,
    title: '💎 Challenge 4: Gem Collector Quest',
    description: 'Collect all the glowing stars scattered around and reach the portal to win!',
    xpReward: 60,
    blocks: [
      { x: -7, y: 0, z: 0, type: 'grass' },
      { x: -6, y: 0, z: 0, type: 'grass' },
      { x: -5, y: 0, z: 2, type: 'star' },
      { x: -5, y: 0, z: -2, type: 'star' },
      { x: -4, y: 0, z: 0, type: 'speed' },
      { x: -2, y: 0, z: 0, type: 'grass' },
      { x: 0, y: 0, z: 0, type: 'bounce' },
      { x: 2, y: 3, z: 0, type: 'grass' },
      { x: 2, y: 4, z: 0, type: 'star' },
      { x: 4, y: 3, z: 0, type: 'grass' },
      { x: 6, y: 3, z: 0, type: 'portal' }
    ] as BlockData[]
  }
];

export const KidsGameLab: React.FC<KidsGameLabProps> = ({ onRewardXP, isEasyMode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockType>('grass');
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    const saved = localStorage.getItem('techsetu-kidgames-custom');
    return saved ? JSON.parse(saved) : CHALLENGES[0].blocks;
  });
  
  const [activeChallengeId, setActiveChallengeId] = useState<number | null>(1);
  const [victoryState, setVictoryState] = useState<boolean>(false);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [totalCoins, setTotalCoins] = useState<number>(0);
  
  // Camera & view states
  const [cameraFollow, setCameraFollow] = useState<boolean>(true);

  // References to communicate with threejs loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const requestRef = useRef<number | null>(null);
  const blocksMeshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  
  // Player physics variables
  const playerMeshRef = useRef<THREE.Group | null>(null);
  const playerVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const playerGrounded = useRef<boolean>(false);
  const playerSpeedBoost = useRef<number>(1);
  const particleSystemsRef = useRef<THREE.Points[]>([]);
  
  // Input tracking
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Save current blocks to local storage
  const saveLevel = () => {
    localStorage.setItem('techsetu-kidgames-custom', JSON.stringify(blocks));
    setActiveChallengeId(null);
  };

  // Clear level
  const clearLevel = () => {
    setBlocks([{ x: 0, y: 0, z: 0, type: 'grass' }]);
    setActiveChallengeId(null);
  };

  // Load a challenge level template
  const loadChallenge = (id: number) => {
    const challenge = CHALLENGES.find(c => c.id === id);
    if (challenge) {
      setBlocks(challenge.blocks);
      setActiveChallengeId(id);
      setIsPlaying(false);
      setVictoryState(false);
    }
  };

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'Space' && isPlaying) {
        e.preventDefault(); // Stop page scrolling
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
    };
  }, [isPlaying]);

  // Main ThreeJS Setup & Grid Renderer
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0815'); // Deep retro cosmic blue
    scene.fog = new THREE.FogExp2('#0a0815', 0.035);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go under floor
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Glowing grid helper floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f0b5, 0x1b1933);
    gridHelper.position.y = -0.51;
    scene.add(gridHelper);

    // Render Blocks
    const renderBlocks = () => {
      // Clear existing block meshes
      Object.values(blocksMeshesRef.current).forEach(mesh => {
        scene.remove(mesh);
      });
      blocksMeshesRef.current = {};

      blocks.forEach((b, idx) => {
        const key = `${b.x},${b.y},${b.z}`;
        let geom: THREE.BufferGeometry;
        let mat: THREE.Material;

        // Custom visuals for each block type
        switch (b.type) {
          case 'grass':
            geom = new THREE.BoxGeometry(0.98, 0.98, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x22c55e, // Emerald green
              roughness: 0.8,
              metalness: 0.1
            });
            break;
          case 'dirt':
            geom = new THREE.BoxGeometry(0.98, 0.98, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0x78350f, // Rich soil brown
              roughness: 0.9
            });
            break;
          case 'lava':
            geom = new THREE.BoxGeometry(0.98, 0.98, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0xf97316, // Bright neon orange
              emissive: 0xef4444,
              emissiveIntensity: 0.6,
              roughness: 0.2
            });
            break;
          case 'bounce':
            geom = new THREE.BoxGeometry(0.98, 0.4, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0xec4899, // Bright pink trampoline pad
              emissive: 0xdb2777,
              emissiveIntensity: 0.3,
              roughness: 0.4
            });
            break;
          case 'speed':
            geom = new THREE.BoxGeometry(0.98, 0.15, 0.98);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0xeab308, // Neon yellow speed boost
              emissive: 0xca8a04,
              emissiveIntensity: 0.5,
              roughness: 0.5
            });
            break;
          case 'star':
            geom = new THREE.OctahedronGeometry(0.35, 0);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0xfacc15, // Golden spinning star
              emissive: 0xeab308,
              emissiveIntensity: 0.8,
              roughness: 0.1,
              metalness: 0.8
            });
            break;
          case 'portal':
            geom = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16);
            mat = new THREE.MeshStandardMaterial({ 
              color: 0xa855f7, // Deep violet portal
              emissive: 0x8b5cf6,
              emissiveIntensity: 1.0,
              transparent: true,
              opacity: 0.85
            });
            break;
          default:
            geom = new THREE.BoxGeometry(1, 1, 1);
            mat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        }

        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(b.x, b.y, b.z);
        mesh.castShadow = b.type !== 'star' && b.type !== 'portal';
        mesh.receiveShadow = b.type !== 'star' && b.type !== 'portal';
        
        // Custom tags on mesh for collision
        mesh.userData = { type: b.type, id: idx, key };

        scene.add(mesh);
        blocksMeshesRef.current[key] = mesh;
      });
    };

    renderBlocks();

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
      // Clean meshes
      Object.values(blocksMeshesRef.current).forEach(mesh => scene.remove(mesh));
    };
  }, [blocks]);

  // Handle building placement or erasure
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying || !sceneRef.current || !cameraRef.current || !rendererRef.current || !mountRef.current) return;

    // Get click coords relative to canvas
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / mountRef.current.clientWidth) * 2 - 1;
    const y = -((event.clientY - rect.top) / mountRef.current.clientHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Let's intersect with current meshes or the base floor plane
    const meshes = Object.values(blocksMeshesRef.current);
    const intersects = raycaster.intersectObjects(meshes);

    if (eraserMode) {
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const key = hitMesh.userData.key;
        setBlocks(prev => prev.filter(b => `${b.x},${b.y},${b.z}` !== key));
      }
    } else {
      let targetPos = new THREE.Vector3();
      
      if (intersects.length > 0) {
        // Place block adjacent to the face we clicked
        const intersect = intersects[0];
        const normal = intersect.face?.normal;
        if (normal) {
          const blockPos = intersect.object.position;
          // Apply transformation based on normal
          targetPos.copy(blockPos).add(normal.clone().round());
        }
      } else {
        // Intersect against floor plane at y = 0
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5);
        const intersectPoint = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(floorPlane, intersectPoint)) {
          targetPos.copy(intersectPoint).round();
        } else {
          return;
        }
      }

      // Snap coordinates to bounds
      const snapX = Math.max(-8, Math.min(8, Math.round(targetPos.x)));
      const snapY = Math.max(0, Math.min(8, Math.round(targetPos.y)));
      const snapZ = Math.max(-8, Math.min(8, Math.round(targetPos.z)));

      // Check if block already exists there
      const exists = blocks.some(b => b.x === snapX && b.y === snapY && b.z === snapZ);
      if (!exists) {
        const newBlock: BlockData = { x: snapX, y: snapY, z: snapZ, type: selectedBlock };
        setBlocks(prev => [...prev, newBlock]);
      }
    }
  };

  // Play Mode Physics & Loop
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    if (!scene || !camera || !renderer || !controls) return;

    if (!isPlaying) {
      // Remove player if back to editor
      if (playerMeshRef.current) {
        scene.remove(playerMeshRef.current);
        playerMeshRef.current = null;
      }
      setVictoryState(false);
      return;
    }

    setVictoryState(false);

    // 1. Initialize Player Model (Cute bouncy robot face)
    const playerGroup = new THREE.Group();
    
    // Core body (Metallic blue-green sphere)
    const bodyGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0x00f0b5, 
      emissive: 0x0ea5e9, 
      emissiveIntensity: 0.3,
      metalness: 0.8, 
      roughness: 0.1 
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.castShadow = true;
    playerGroup.add(bodyMesh);

    // Glowing face screen
    const faceGeom = new THREE.SphereGeometry(0.18, 16, 16);
    faceGeom.scale(1.2, 0.7, 0.2); // Squished visor
    const faceMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const faceMesh = new THREE.Mesh(faceGeom, faceMat);
    faceMesh.position.set(0, 0.08, 0.25);
    playerGroup.add(faceMesh);

    // Two little cute glow eyes
    const eyeGeom = new THREE.SphereGeometry(0.04, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xec4899 }); // Pink eyes
    const eyeLeft = new THREE.Mesh(eyeGeom, eyeMat);
    eyeLeft.position.set(-0.07, 0.08, 0.37);
    const eyeRight = new THREE.Mesh(eyeGeom, eyeMat);
    eyeRight.position.set(0.07, 0.08, 0.37);
    playerGroup.add(eyeLeft);
    playerGroup.add(eyeRight);

    // Set spawn point to the first grass block, or 0,1,0
    const startBlock = blocks.find(b => b.type === 'grass') || { x: 0, y: 0, z: 0 };
    playerGroup.position.set(startBlock.x, startBlock.y + 1.2, startBlock.z);
    scene.add(playerGroup);
    playerMeshRef.current = playerGroup;

    playerVel.current.set(0, 0, 0);
    playerGrounded.current = false;
    playerSpeedBoost.current = 1;

    // Reset collectibles count
    const starsCount = blocks.filter(b => b.type === 'star').length;
    setTotalCoins(starsCount);
    setCoinsCollected(0);

    // Dynamic Level state mapping: we clone blocks because we can hide stars as they get collected
    const levelStateBlocks = blocks.map(b => ({ ...b, active: true }));

    // Particle Burst Spawner helper
    const spawnParticleExplosion = (pos: THREE.Vector3, colorHex: number, count = 20) => {
      const geometry = new THREE.BufferGeometry();
      const positions: number[] = [];
      const velocities: THREE.Vector3[] = [];

      for (let i = 0; i < count; i++) {
        positions.push(pos.x, pos.y, pos.z);
        velocities.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * 4,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 4
          )
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: colorHex,
        size: 0.22,
        transparent: true,
        opacity: 1
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particleSystemsRef.current.push(particles);

      // Animation variables on the object itself
      (particles as any).userData = { velocities, age: 0, maxAge: 40 };
    };

    // Respawn logic
    const respawn = () => {
      synth.playLava();
      spawnParticleExplosion(playerGroup.position, 0xef4444, 25);
      
      // Momentarily hide player
      playerGroup.visible = false;
      playerVel.current.set(0, 0, 0);
      
      setTimeout(() => {
        playerGroup.position.set(startBlock.x, startBlock.y + 1.2, startBlock.z);
        playerGroup.visible = true;
      }, 700);
    };

    let lastTime = performance.now();

    // 2. Physics & Animation loop
    const gameLoop = () => {
      const time = performance.now();
      const dt = Math.min((time - lastTime) / 1000, 0.1); // Cap time step
      lastTime = time;

      if (!playerMeshRef.current) return;

      // Update particle animations
      particleSystemsRef.current.forEach((ps, idx) => {
        const data = ps.userData;
        data.age += 1;
        
        const posAttr = ps.geometry.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let i = 0; i < data.velocities.length; i++) {
          const vel = data.velocities[i];
          positions[i * 3] += vel.x * dt;
          positions[i * 3 + 1] += vel.y * dt;
          positions[i * 3 + 2] += vel.z * dt;
          // Apply gravity to particles
          vel.y -= 9.8 * dt;
        }
        posAttr.needsUpdate = true;
        
        // Fade opacity
        (ps.material as THREE.PointsMaterial).opacity = 1 - (data.age / data.maxAge);

        if (data.age >= data.maxAge) {
          scene.remove(ps);
          particleSystemsRef.current.splice(idx, 1);
        }
      });

      if (playerGroup.visible && !victoryState) {
        // Keyboard inputs force application
        const moveSpeed = 6 * playerSpeedBoost.current;
        let dx = 0;
        let dz = 0;

        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) dz -= 1;
        if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) dz += 1;
        if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) dx -= 1;
        if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) dx += 1;

        // Apply input force
        const inputVec = new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(moveSpeed);
        playerVel.current.x = inputVec.x;
        playerVel.current.z = inputVec.z;

        // Apply gravity
        playerVel.current.y -= 26 * dt;

        // Jump handler
        if ((keysRef.current['Space'] || keysRef.current['KeyW'] && keysRef.current['Space']) && playerGrounded.current) {
          playerVel.current.y = 10.5;
          playerGrounded.current = false;
          synth.playJump();
        }

        // Apply velocity movement
        playerGroup.position.add(playerVel.current.clone().multiplyScalar(dt));

        // Fall death trigger
        if (playerGroup.position.y < -12) {
          respawn();
        }

        // AABB Collision Detection against solid blocks
        playerGrounded.current = false;
        playerSpeedBoost.current = 1;

        const playerRadius = 0.35;
        const pPos = playerGroup.position;

        levelStateBlocks.forEach(b => {
          if (!b.active) return;

          // Box bounds for block
          const sizeX = 1;
          const sizeY = b.type === 'bounce' ? 0.4 : (b.type === 'speed' ? 0.15 : 1);
          const sizeZ = 1;

          const minX = b.x - sizeX/2;
          const maxX = b.x + sizeX/2;
          const minY = b.y - sizeY/2;
          const maxY = b.y + sizeY/2;
          const minZ = b.z - sizeZ/2;
          const maxZ = b.z + sizeZ/2;

          // Closest point on AABB to sphere center
          const cx = Math.max(minX, Math.min(pPos.x, maxX));
          const cy = Math.max(minY, Math.min(pPos.y, maxY));
          const cz = Math.max(minZ, Math.min(pPos.z, maxZ));

          // Distance sphere center to closest point
          const distSq = (pPos.x - cx) ** 2 + (pPos.y - cy) ** 2 + (pPos.z - cz) ** 2;

          if (distSq < playerRadius * playerRadius) {
            const overlap = playerRadius - Math.sqrt(distSq);

            // Handle specific block type trigger behavior
            if (b.type === 'lava') {
              respawn();
              return;
            }

            if (b.type === 'star') {
              // Collect star
              b.active = false;
              // Remove block mesh
              const meshKey = `${b.x},${b.y},${b.z}`;
              const mesh = blocksMeshesRef.current[meshKey];
              if (mesh) {
                scene.remove(mesh);
                delete blocksMeshesRef.current[meshKey];
              }
              synth.playCoin();
              spawnParticleExplosion(new THREE.Vector3(b.x, b.y, b.z), 0xfacc15, 12);
              setCoinsCollected(prev => prev + 1);
              return;
            }

            if (b.type === 'portal') {
              // Trigger victory!
              setVictoryState(true);
              synth.playWin();
              spawnParticleExplosion(playerGroup.position, 0xa855f7, 40);
              
              // Reward global XP
              let reward = 20;
              if (activeChallengeId) {
                const chal = CHALLENGES.find(c => c.id === activeChallengeId);
                reward = chal ? chal.xpReward : reward;
              }
              onRewardXP(reward);
              return;
            }

            // Normal Solid Blocks collision resolution
            const dir = pPos.clone().sub(new THREE.Vector3(cx, cy, cz));
            if (dir.lengthSq() === 0) dir.y = 1; // Safeguard division
            dir.normalize();

            // Resolve overlap by pushing sphere out
            playerGroup.position.add(dir.multiplyScalar(overlap));

            // Collision normal analysis
            const absX = Math.abs(pPos.x - cx);
            const absY = Math.abs(pPos.y - cy);
            const absZ = Math.abs(pPos.z - cz);

            if (absY > absX && absY > absZ) {
              if (pPos.y > cy) {
                // Standing on top of block
                playerGrounded.current = true;
                playerVel.current.y = 0;
                
                // Specific ground modifiers
                if (b.type === 'bounce') {
                  playerVel.current.y = 14.5;
                  playerGrounded.current = false;
                  synth.playBounce();
                  spawnParticleExplosion(new THREE.Vector3(b.x, b.y + 0.3, b.z), 0xec4899, 10);
                } else if (b.type === 'speed') {
                  playerSpeedBoost.current = 1.9;
                  if (Math.random() < 0.25) {
                    synth.playBoost();
                    spawnParticleExplosion(new THREE.Vector3(b.x, b.y + 0.1, b.z), 0xeab308, 4);
                  }
                }
              } else {
                // Collided with ceiling
                playerVel.current.y = Math.min(0, playerVel.current.y);
              }
            } else {
              // Side collisions: stop wall velocity
              if (absX > absZ) {
                playerVel.current.x = 0;
              } else {
                playerVel.current.z = 0;
              }
            }
          }
        });

        // Rotate cute robot eyes and face based on moving direction
        if (dx !== 0 || dz !== 0) {
          const angle = Math.atan2(dx, dz);
          playerGroup.rotation.y = angle;
        }

        // Add subtle hover/rolling oscillation
        bodyMesh.position.y = Math.sin(time * 0.015) * 0.05;
      }

      // Camera Follow behavior
      if (cameraFollow && playerMeshRef.current) {
        const playerPos = playerMeshRef.current.position;
        // Smoothly lerp camera position
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, playerPos.x, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, playerPos.z + 9, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, playerPos.y + 6, 0.08);
        
        controls.target.copy(playerPos);
      } else {
        controls.update();
      }

      // Spin stars and portals in the scene
      Object.keys(blocksMeshesRef.current).forEach(key => {
        const mesh = blocksMeshesRef.current[key];
        if (mesh.userData.type === 'star') {
          mesh.rotation.y += 1.8 * dt;
          mesh.position.y += Math.sin(time * 0.005 + mesh.userData.id) * 0.003;
        } else if (mesh.userData.type === 'portal') {
          mesh.rotation.y += 0.8 * dt;
        }
      });

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, blocks, cameraFollow, victoryState]);

  // Touch control handlers
  const handleTouchDown = (key: string) => {
    keysRef.current[key] = true;
  };
  const handleTouchUp = (key: string) => {
    keysRef.current[key] = false;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0815] text-white rounded-2xl overflow-hidden border border-white/15 relative">
      
      {/* Top Glass Panel Info Header */}
      <div className="absolute top-0 inset-x-0 p-4 bg-black/60 backdrop-blur-md border-b border-white/10 z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧸</span>
            <h2 className="text-base font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 uppercase">
              {isEasyMode ? "My 3D Toy Maker 🎮" : "Kids 3D Game Lab"}
            </h2>
            {activeChallengeId && (
              <span className="text-[10px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full font-bold">
                Challenge {activeChallengeId}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-300">
            {isEasyMode 
              ? "Build your own level using blocks, press PLAY, and run to the purple portal!"
              : "Design custom retro 3D platform levels, collect stars, and complete quests to earn XP."}
          </p>
        </div>

        {/* Level Editor Tools or Play mode status */}
        <div className="flex items-center gap-3">
          {isPlaying ? (
            <div className="flex items-center gap-4.5 bg-black/40 px-4 py-2 border border-white/5 rounded-xl text-xs font-mono font-bold">
              <span className="text-pink-400 flex items-center gap-1.5">
                💎 Stars: {coinsCollected} / {totalCoins}
              </span>
              <button 
                onClick={() => setCameraFollow(p => !p)}
                className={`text-[10px] px-2.5 py-1 rounded border transition-all ${
                  cameraFollow ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                🎥 {cameraFollow ? "Follow Player" : "Free Camera"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={saveLevel}
                className="btn-editor-secondary flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                title="Save current block design to memory"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={clearLevel}
                className="btn-editor-secondary flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                title="Erase all blocks from grid"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* PLAY/STOP Toggle Button */}
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              // Initialize sound on play click
              if (!isPlaying) {
                synth.playJump();
              }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/10 border border-red-500/30' 
                : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black shadow-emerald-500/10'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Edit Mode</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>Play Game</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Mount Point */}
      <div 
        ref={mountRef} 
        onClick={handleCanvasClick}
        className="flex-1 w-full cursor-pointer"
        style={{ minHeight: '450px' }}
      />

      {/* Grid build pallet & brush selector (Only in Editor Mode) */}
      {!isPlaying && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-3 bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3 z-10 max-w-[90%] overflow-x-auto">
          <div className="text-[10px] uppercase font-bold text-slate-400 border-r border-white/10 pr-3 mr-1 shrink-0 select-none">
            🎨 Blocks
          </div>

          <div className="flex items-center gap-2">
            {[
              { type: 'grass', emoji: '🟩', name: 'Grass Walkway' },
              { type: 'dirt', emoji: '🟫', name: 'Soil Block' },
              { type: 'lava', emoji: '🔥', name: 'Lava Hazard' },
              { type: 'bounce', emoji: '💗', name: 'Bounce Pad' },
              { type: 'speed', emoji: '⚡', name: 'Speed Boost' },
              { type: 'star', emoji: '⭐', name: 'Collect Star' },
              { type: 'portal', emoji: '🔮', name: 'Goal Portal' },
            ].map(item => (
              <button
                key={item.type}
                onClick={() => {
                  setSelectedBlock(item.type as BlockType);
                  setEraserMode(false);
                }}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[55px] border transition-all cursor-pointer ${
                  selectedBlock === item.type && !eraserMode
                    ? 'bg-pink-500/25 border-pink-500 text-pink-300 scale-105 shadow-md shadow-pink-500/10'
                    : 'bg-white/5 border-white/15 hover:bg-white/10 text-slate-300'
                }`}
                title={item.name}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="text-[8px] font-bold select-none">{isEasyMode ? item.emoji : item.type}</span>
              </button>
            ))}

            <div className="w-[1px] h-8 bg-white/10 mx-1 shrink-0" />

            <button
              onClick={() => setEraserMode(true)}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[55px] border transition-all cursor-pointer ${
                eraserMode
                  ? 'bg-red-500/25 border-red-500 text-red-300 scale-105 shadow-md shadow-red-500/10'
                  : 'bg-white/5 border-white/15 hover:bg-white/10 text-slate-300'
              }`}
              title="Click on blocks to remove them"
            >
              <span className="text-base">❌</span>
              <span className="text-[8px] font-bold select-none">Eraser</span>
            </button>
          </div>
        </div>
      )}

      {/* On-screen control buttons for mobile-friendly Play Mode */}
      {isPlaying && (
        <div className="absolute bottom-4 inset-x-4 flex justify-between items-end pointer-events-none z-10">
          
          {/* Movement Arrow Keys (Left Side) */}
          <div className="grid grid-cols-3 gap-2 bg-black/60 p-2.5 rounded-2xl border border-white/5 pointer-events-auto shadow-xl">
            <div />
            <button
              onMouseDown={() => handleTouchDown('KeyW')}
              onMouseUp={() => handleTouchUp('KeyW')}
              onTouchStart={() => handleTouchDown('KeyW')}
              onTouchEnd={() => handleTouchUp('KeyW')}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 active:bg-pink-500 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-all text-slate-200 active:text-white"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />

            <button
              onMouseDown={() => handleTouchDown('KeyA')}
              onMouseUp={() => handleTouchUp('KeyA')}
              onTouchStart={() => handleTouchDown('KeyA')}
              onTouchEnd={() => handleTouchUp('KeyA')}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 active:bg-pink-500 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-all text-slate-200 active:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => handleTouchDown('KeyS')}
              onMouseUp={() => handleTouchUp('KeyS')}
              onTouchStart={() => handleTouchDown('KeyS')}
              onTouchEnd={() => handleTouchUp('KeyS')}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 active:bg-pink-500 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-all text-slate-200 active:text-white"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onMouseDown={() => handleTouchDown('KeyD')}
              onMouseUp={() => handleTouchUp('KeyD')}
              onTouchStart={() => handleTouchDown('KeyD')}
              onTouchEnd={() => handleTouchUp('KeyD')}
              className="w-10 h-10 bg-white/10 hover:bg-white/15 active:bg-pink-500 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-all text-slate-200 active:text-white"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Jump Button (Right Side) */}
          <div className="bg-black/60 p-2.5 rounded-2xl border border-white/5 pointer-events-auto shadow-xl">
            <button
              onMouseDown={() => handleTouchDown('Space')}
              onMouseUp={() => handleTouchUp('Space')}
              onTouchStart={() => handleTouchDown('Space')}
              onTouchEnd={() => handleTouchUp('Space')}
              className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-600 hover:brightness-110 border border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer shadow-lg transition-all text-white font-mono active:scale-95"
            >
              <span className="text-[10px] uppercase font-black tracking-widest leading-none mb-1">Jump</span>
              <span className="text-[8px] opacity-60">Space</span>
            </button>
          </div>
        </div>
      )}

      {/* Preset Level challenges floating panel (Right Side) */}
      {!isPlaying && (
        <div className="absolute top-24 right-4 w-72 bg-black/65 backdrop-blur-xl border border-white/10 p-4 rounded-2xl space-y-3 z-10 shadow-2xl">
          <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>{isEasyMode ? "My Level Quests 🧸" : "Learning Quests"}</span>
          </h3>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {CHALLENGES.map(c => (
              <button
                key={c.id}
                onClick={() => loadChallenge(c.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                  activeChallengeId === c.id
                    ? 'bg-purple-500/20 border-purple-500/60 text-white'
                    : 'bg-white/3 border-white/5 hover:bg-white/6 text-slate-300'
                }`}
              >
                <div className="text-[10.5px] font-extrabold flex justify-between items-center w-full">
                  <span>{c.title}</span>
                  <span className="text-[9px] font-mono text-emerald-400">+{c.xpReward} XP</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">{c.description}</p>
              </button>
            ))}
          </div>
          
          <div className="text-[9px] text-slate-400 font-mono text-center">
            * Complete a quest to earn direct XP!
          </div>
        </div>
      )}

      {/* VICTORY OVERLAY SCREEN */}
      {victoryState && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-lg z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-sm relative">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/20 border border-white/20 animate-bounce">
              <Trophy className="w-10 h-10 text-black" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 tracking-wider">
                {isEasyMode ? "You Did It! 🎉" : "Victory Achieved!"}
              </h1>
              <p className="text-xs text-slate-300">
                {isEasyMode 
                  ? "Awesome! You completed this quest! Tap the button below to build or select another quest."
                  : "You successfully completed the 3D level quest objectives and reached the finish portal!"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-around gap-2 max-w-[280px] mx-auto">
              <div className="text-center font-mono">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">XP Rewarded</span>
                <span className="text-base font-black text-emerald-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  +{activeChallengeId ? CHALLENGES.find(c => c.id === activeChallengeId)?.xpReward : 20} XP
                </span>
              </div>
              <div className="w-[1px] h-8 bg-white/10" />
              <div className="text-center font-mono">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Stars Collected</span>
                <span className="text-base font-black text-pink-400">
                  {coinsCollected} / {totalCoins}
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setVictoryState(false);
                  setIsPlaying(false);
                }}
                className="px-5 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                onClick={() => {
                  setVictoryState(false);
                  if (activeChallengeId && activeChallengeId < CHALLENGES.length) {
                    loadChallenge(activeChallengeId + 1);
                  } else {
                    loadChallenge(1);
                  }
                }}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/20"
              >
                {activeChallengeId && activeChallengeId < CHALLENGES.length ? "Next Quest" : "Play Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
