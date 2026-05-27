"use client";

import React, { useState, useEffect } from "react";
import { useStatsStore } from "@/stores/statsStore";
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  TouchSensor, 
  DragEndEvent,
  useDroppable
} from "@dnd-kit/core";
import { 
  useSortable, 
  SortableContext, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ListTodo, 
  Play, 
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface Goal {
  id: string;
  title: string;
  isCompleted: boolean;
  xpReward: number;
  createdAt: string;
}

// Kanban Column component
interface ColumnProps {
  id: string;
  title: string;
  goals: Goal[];
  colorClass: string;
  icon: React.ReactNode;
}

function KanbanColumn({ id, title, goals, colorClass, icon }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[280px] bg-slate-950/45 border border-border/80 rounded-sm p-4 flex flex-col min-h-[500px]">
      {/* Column Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
        <div className="flex items-center gap-5">
          <span className={colorClass}>{icon}</span>
          <h3 className="text-xs font-black uppercase text-white tracking-widest font-display">{title}</h3>
        </div>
        <span className="text-sm font-mono px-2 py-2 bg-white/5 border border-border text-muted-foreground rounded-sm">
          {goals.length}
        </span>
      </div>

      {/* Sortable Drop Area */}
      <div ref={setNodeRef} className="flex-1 flex flex-col gap-5.5">
        <SortableContext items={goals.map(g => g.id)} strategy={verticalListSortingStrategy}>
          {goals.map((goal) => (
            <SortableCard key={goal.id} goal={goal} />
          ))}
        </SortableContext>
        {goals.length === 0 && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-border/40 rounded-sm py-12 text-center select-none text-sm text-muted-foreground uppercase font-bold tracking-wider">
            Vazio
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable Kanban Card component
function SortableCard({ goal }: { goal: Goal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Deseja realmente excluir esta meta permanentemente?")) return;
    try {
      const res = await fetch(`/api/dashboard/goals/${goal.id}`, { method: "DELETE" });
      if (res.ok) {
        useStatsStore.getState().deleteGoal(goal.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3.5 rounded-sm border bg-slate-950/60 shadow-sm cursor-grab active:cursor-grabbing transition-all select-none hover:border-primary/20 flex flex-col gap-3 relative overflow-hidden group ${
        goal.isCompleted 
          ? "border-emerald-500/20 bg-emerald-950/5 opacity-70" 
          : "border-border"
      }`}
    >
      <div className="flex justify-between items-start gap-5">
        <p className={`text-xs font-semibold leading-snug ${goal.isCompleted ? "line-through text-muted-foreground" : "text-white"}`}>
          {goal.title}
        </p>
        <button
          onClick={handleDelete}
          className="p-1 rounded-sm border border-transparent hover:border-red-500/20 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="flex justify-between items-center text-xs leading-none mt-1">
        <span className={`px-4 py-2 rounded font-black tracking-wider uppercase ${
          goal.isCompleted 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-primary/10 text-primary border border-primary/20"
        }`}>
          +{goal.xpReward} XP
        </span>
        
        <span className="text-muted-foreground/60 font-mono">
          {new Date(goal.createdAt).toLocaleDateString("pt-BR", {month: "short", day: "numeric"})}
        </span>
      </div>
    </div>
  );
}

// Mobile Kanban Section (Simple List with buttons)
function MobileKanbanSection({
  title,
  goals,
  icon,
  colorClass,
  onMove
}: {
  title: string;
  goals: Goal[];
  icon: React.ReactNode;
  colorClass: string;
  onMove: (goalId: string, destCol: 'todo' | 'doing' | 'done', isCurrentlyCompleted: boolean) => void;
}) {
  return (
    <div className="flex flex-col bg-slate-950/45 border border-border/80 rounded-sm p-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
        <div className="flex items-center gap-4">
          <span className={colorClass}>{icon}</span>
          <h3 className="text-xs font-black uppercase text-white tracking-widest font-display">{title}</h3>
        </div>
        <span className="text-sm font-mono px-2 py-1 bg-white/5 border border-border text-muted-foreground rounded-sm">
          {goals.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3">
        {goals.map((goal) => (
          <div key={goal.id} className={`p-3.5 rounded-sm border bg-slate-950/60 shadow-sm flex flex-col gap-3 relative overflow-hidden ${goal.isCompleted ? "border-emerald-500/20 bg-emerald-950/5 opacity-70" : "border-border"}`}>
            <div className="flex justify-between items-start gap-3">
              <p className={`text-xs font-semibold leading-snug ${goal.isCompleted ? "line-through text-muted-foreground" : "text-white"}`}>
                {goal.title}
              </p>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className={`px-2 py-1 rounded font-black tracking-wider uppercase ${goal.isCompleted ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary border border-primary/20"}`}>
                +{goal.xpReward} XP
              </span>
            </div>
            {/* Move Buttons */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
              {title !== "A Fazer" && (
                 <button onClick={() => onMove(goal.id, 'todo', goal.isCompleted)} className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-muted/40 hover:bg-muted rounded text-muted-foreground hover:text-[#8fe319] transition-colors">A Fazer</button>
              )}
              {title !== "Fazendo" && (
                 <button onClick={() => onMove(goal.id, 'doing', goal.isCompleted)} className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-amber-500/10 hover:bg-amber-500/20 rounded text-amber-500 transition-colors">Fazendo</button>
              )}
              {title !== "Concluído" && (
                 <button onClick={() => onMove(goal.id, 'done', goal.isCompleted)} className="flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 hover:bg-emerald-500/20 rounded text-emerald-500 transition-colors">Concluído</button>
              )}
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground uppercase font-bold tracking-wider">
            Vazio
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { data, fetchStats, isLoading } = useStatsStore();
  const [isMounted, setIsMounted] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalXp, setNewGoalXp] = useState(100);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [doingIds, setDoingIds] = useState<string[]>([]);

  // Configure Sensors (both Mouse/Pointer and Touch for mobile compatibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts only after moving 8 pixels (allows clicking buttons)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Press and hold for 200ms on mobile to drag
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    setIsMounted(true);
    useStatsStore.getState().fetchStats();
    
    // Load Kanban doing list from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexus_kanban_doing");
      if (saved) {
        setDoingIds(JSON.parse(saved));
      }
    }
  }, []);

  const saveDoingToLocalStorage = (ids: string[]) => {
    setDoingIds(ids);
    localStorage.setItem("nexus_kanban_doing", JSON.stringify(ids));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !data) return;

    const goalId = active.id as string;
    const destCol = over.id as string;
    const goal = data.goals.find(g => g.id === goalId);
    if (!goal) return;

    // Moving items
    if (destCol === "todo") {
      // Remove from Doing
      saveDoingToLocalStorage(doingIds.filter(id => id !== goalId));
      // Mark incomplete in DB if completed
      if (goal.isCompleted) {
        await updateGoalStatus(goalId, false);
      }
    } else if (destCol === "doing") {
      // Add to Doing
      if (!doingIds.includes(goalId)) {
        saveDoingToLocalStorage([...doingIds, goalId]);
      }
      // Mark incomplete in DB if completed
      if (goal.isCompleted) {
        await updateGoalStatus(goalId, false);
      }
    } else if (destCol === "done") {
      // Remove from Doing
      saveDoingToLocalStorage(doingIds.filter(id => id !== goalId));
      // Mark complete in DB if not completed
      if (!goal.isCompleted) {
        await updateGoalStatus(goalId, true);
        triggerConfetti();
      }
    }
  };

  const moveGoalMobile = async (goalId: string, destCol: 'todo' | 'doing' | 'done', isCurrentlyCompleted: boolean) => {
    if (destCol === "todo") {
      saveDoingToLocalStorage(doingIds.filter(id => id !== goalId));
      if (isCurrentlyCompleted) {
        await updateGoalStatus(goalId, false);
      }
    } else if (destCol === "doing") {
      if (!doingIds.includes(goalId)) {
        saveDoingToLocalStorage([...doingIds, goalId]);
      }
      if (isCurrentlyCompleted) {
        await updateGoalStatus(goalId, false);
      }
    } else if (destCol === "done") {
      saveDoingToLocalStorage(doingIds.filter(id => id !== goalId));
      if (!isCurrentlyCompleted) {
        await updateGoalStatus(goalId, true);
        triggerConfetti();
      }
    }
  };

  const updateGoalStatus = async (id: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/dashboard/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (res.ok) {
        useStatsStore.getState().toggleGoal(id, isCompleted);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#c5ff1a", "#06b6d4", "#a78bfa"]
    });
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    setIsAddingGoal(true);
    try {
      const res = await fetch("/api/dashboard/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGoalTitle, xpReward: newGoalXp }),
      });

      if (res.ok) {
        const goal = await res.json();
        useStatsStore.getState().addGoal(goal);
        setNewGoalTitle("");
        setNewGoalXp(100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingGoal(false);
    }
  };

  if (!isMounted || isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-primary font-bold tracking-widest uppercase">Carregando Quadro Kanban</span>
      </div>
    );
  }

  // Filter goals into column buckets
  const allGoals = data.goals;
  
  const todoGoals = allGoals.filter(g => !g.isCompleted && !doingIds.includes(g.id));
  const doingGoals = allGoals.filter(g => !g.isCompleted && doingIds.includes(g.id));
  const doneGoals = allGoals.filter(g => g.isCompleted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-5.5 font-display">
            <Trophy className="w-5 h-5 text-primary" />
            Metas & Kanban
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
            Arraste os cards para organizar e conclua para ganhar XP e Subir de Nível.
          </p>
        </div>

        {/* Quick add Goal Bar */}
        <form onSubmit={handleCreateGoal} className="flex gap-5 max-w-md w-full sm:w-auto">
          <input
            type="text"
            required
            placeholder="Nova meta rápida..."
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-950/40 border border-border focus:border-primary rounded-sm text-white placeholder-muted-foreground text-xs focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isAddingGoal}
            className="px-4 py-2 bg-primary text-black font-extrabold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all rounded-sm cursor-pointer shadow-md shadow-primary/10 flex items-center justify-center gap-4 shrink-0"
          >
            {isAddingGoal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </form>
      </div>

      {/* Mobile Kanban (sm:hidden) */}
      <div className="sm:hidden flex flex-col gap-6 pb-6">
        <MobileKanbanSection 
          title="A Fazer" 
          goals={todoGoals} 
          colorClass="text-rose-400" 
          icon={<ListTodo className="w-4 h-4" />} 
          onMove={moveGoalMobile}
        />
        <MobileKanbanSection 
          title="Fazendo" 
          goals={doingGoals} 
          colorClass="text-amber-400" 
          icon={<Play className="w-4 h-4 fill-current rotate-0" />} 
          onMove={moveGoalMobile}
        />
        <MobileKanbanSection 
          title="Concluído" 
          goals={doneGoals} 
          colorClass="text-emerald-400" 
          icon={<Sparkles className="w-4 h-4" />} 
          onMove={moveGoalMobile}
        />
      </div>

      {/* DndContext Wrapping Kanban Grid (Desktop Only) */}
      <div className="hidden sm:block">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 overflow-x-auto pb-6">
            <KanbanColumn 
              id="todo" 
              title="A Fazer" 
              goals={todoGoals} 
              colorClass="text-rose-400" 
              icon={<ListTodo className="w-4 h-4" />} 
            />
            <KanbanColumn 
              id="doing" 
              title="Fazendo" 
              goals={doingGoals} 
              colorClass="text-amber-400" 
              icon={<Play className="w-4 h-4 fill-current rotate-0" />} 
            />
            <KanbanColumn 
              id="done" 
              title="Concluído" 
              goals={doneGoals} 
              colorClass="text-emerald-400" 
              icon={<Sparkles className="w-4 h-4" />} 
            />
          </div>
        </DndContext>
      </div>
    </div>
  );
}
