import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Send, Mail, MailOpen, Clock, Paperclip, Plus, CheckCircle2, 
  Inbox, SendHorizontal, Filter, Search, FileText, HelpCircle, Calendar, AlertCircle, Users
} from 'lucide-react';
import { mockMessages, mockEmployees } from '@/data/mockData';
import { DEPARTMENTS, Employee } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/services/dataStorage';
import { logAction } from '@/services/auditLog';
import { AttendanceMessage } from '@/types/attendance';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Message categories
type MessageCategory = 'justificacion' | 'consulta' | 'permiso' | 'vacaciones' | 'queja' | 'otro';

interface ExtendedMessage extends AttendanceMessage {
  category?: MessageCategory;
}

const MESSAGE_CATEGORIES: Record<MessageCategory, { label: string; icon: typeof FileText; color: string }> = {
  justificacion: { label: 'Justificación', icon: FileText, color: 'bg-blue-500/10 text-blue-500' },
  consulta: { label: 'Consulta', icon: HelpCircle, color: 'bg-purple-500/10 text-purple-500' },
  permiso: { label: 'Solicitud de Permiso', icon: Calendar, color: 'bg-green-500/10 text-green-500' },
  vacaciones: { label: 'Vacaciones', icon: Calendar, color: 'bg-orange-500/10 text-orange-500' },
  queja: { label: 'Queja/Reclamo', icon: AlertCircle, color: 'bg-red-500/10 text-red-500' },
  otro: { label: 'Otro', icon: MessageSquare, color: 'bg-gray-500/10 text-gray-500' },
};

// Recipient types
type RecipientType = 'employee' | 'rrhh' | 'jefe' | 'gerencia';

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ExtendedMessage[]>(() => 
    loadFromStorage(STORAGE_KEYS.MESSAGES, mockMessages)
  );
  const [selectedMessage, setSelectedMessage] = useState<ExtendedMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // New message form
  const [recipientType, setRecipientType] = useState<RecipientType>('rrhh');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<MessageCategory>('consulta');
  const [newSubject, setNewSubject] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  
  // Reply form
  const [replyText, setReplyText] = useState('');

  const currentUserId = user?.id || 'current-user';
  const currentUserName = `${user?.nombres || 'Usuario'} ${user?.apellidos || ''}`.trim();

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
  }, [messages]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Filter by sent/received
      if (activeFilter === 'sent' && msg.fromUserId !== currentUserId) return false;
      if (activeFilter === 'received' && msg.toUserId !== currentUserId) return false;
      
      // Filter by category
      if (categoryFilter !== 'all' && msg.category !== categoryFilter) return false;
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          msg.subject.toLowerCase().includes(search) ||
          msg.message.toLowerCase().includes(search) ||
          msg.fromUserName.toLowerCase().includes(search) ||
          msg.toUserName.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [messages, activeFilter, categoryFilter, searchTerm, currentUserId]);

  // Stats
  const stats = useMemo(() => {
    const received = messages.filter(m => m.toUserId === currentUserId);
    const sent = messages.filter(m => m.fromUserId === currentUserId);
    const unread = received.filter(m => !m.readAt);
    return { received: received.length, sent: sent.length, unread: unread.length };
  }, [messages, currentUserId]);

  const getRecipientName = () => {
    if (recipientType === 'employee' && selectedEmployee) {
      return selectedEmployee.name;
    }
    switch (recipientType) {
      case 'rrhh': return 'Recursos Humanos';
      case 'jefe': return 'Mi Jefe Directo';
      case 'gerencia': return 'Gerencia General';
      default: return '';
    }
  };

  const getRecipientId = () => {
    if (recipientType === 'employee' && selectedEmployee) {
      return selectedEmployee.id;
    }
    return recipientType;
  };

  const handleSend = () => {
    if (!newSubject || !newMessageText) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    if (recipientType === 'employee' && !selectedEmployee) {
      toast.error('Seleccione un empleado');
      return;
    }

    const newMessage: ExtendedMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: currentUserId,
      fromUserName: currentUserName,
      toUserId: getRecipientId(),
      toUserName: getRecipientName(),
      department: 'ti',
      subject: newSubject,
      message: newMessageText,
      category: newCategory,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [newMessage, ...prev]);
    
    logAction('CREATE', 'message', newMessage.id, currentUserId, currentUserName, 
      `Envió mensaje: ${newSubject} (${MESSAGE_CATEGORIES[newCategory].label})`);
    
    toast.success('Mensaje enviado correctamente');
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setRecipientType('rrhh');
    setSelectedEmployee(null);
    setNewCategory('consulta');
    setNewSubject('');
    setNewMessageText('');
  };

  const handleMarkAsRead = (message: ExtendedMessage) => {
    if (!message.readAt && message.toUserId === currentUserId) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, readAt: new Date().toISOString() } : m
      ));
    }
  };

  const handleReply = () => {
    if (!selectedMessage || !replyText) {
      toast.error('Escriba un mensaje de respuesta');
      return;
    }

    const replyMessage: ExtendedMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: currentUserId,
      fromUserName: currentUserName,
      toUserId: selectedMessage.fromUserId,
      toUserName: selectedMessage.fromUserName,
      department: selectedMessage.department,
      subject: `Re: ${selectedMessage.subject}`,
      message: replyText,
      category: selectedMessage.category,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [
      replyMessage,
      ...prev.map(m => m.id === selectedMessage.id ? { ...m, replied: true } : m)
    ]);

    logAction('UPDATE', 'message', selectedMessage.id, currentUserId, currentUserName, 
      `Respondió mensaje: ${selectedMessage.subject}`);

    toast.success('Respuesta enviada');
    setReplyDialogOpen(false);
    setReplyText('');
  };

  const handleMarkAsResolved = () => {
    if (!selectedMessage) return;

    setMessages(prev => prev.map(m => 
      m.id === selectedMessage.id ? { ...m, replied: true } : m
    ));

    logAction('UPDATE', 'message', selectedMessage.id, currentUserId, currentUserName, 
      `Marcó como resuelto: ${selectedMessage.subject}`);

    toast.success('Mensaje marcado como resuelto');
    setSelectedMessage(prev => prev ? { ...prev, replied: true } : null);
  };

  const handleSelectMessage = (msg: ExtendedMessage) => {
    setSelectedMessage(msg);
    handleMarkAsRead(msg);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryBadge = (category?: MessageCategory) => {
    if (!category) return null;
    const cat = MESSAGE_CATEGORIES[category];
    const Icon = cat.icon;
    return (
      <Badge variant="secondary" className={`gap-1 ${cat.color}`}>
        <Icon className="w-3 h-3" />
        {cat.label}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <p className="text-muted-foreground">
              Comunicación interna entre empleados, jefes y RRHH
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Mensaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enviar Mensaje</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Recipient Type */}
                <div className="space-y-2">
                  <Label>Tipo de Destinatario</Label>
                  <Select value={recipientType} onValueChange={(v) => {
                    setRecipientType(v as RecipientType);
                    setSelectedEmployee(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                      <SelectItem value="jefe">Mi Jefe Directo</SelectItem>
                      <SelectItem value="gerencia">Gerencia General</SelectItem>
                      <SelectItem value="employee">Empleado Específico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Selector */}
                {recipientType === 'employee' && (
                  <div className="space-y-2">
                    <Label>Seleccionar Empleado</Label>
                    <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          {selectedEmployee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {getInitials(selectedEmployee.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{selectedEmployee.name}</span>
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {DEPARTMENTS[selectedEmployee.department]?.name}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Buscar empleado...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar por nombre..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron empleados</CommandEmpty>
                            <CommandGroup>
                              {mockEmployees.map(emp => (
                                <CommandItem
                                  key={emp.id}
                                  value={emp.name}
                                  onSelect={() => {
                                    setSelectedEmployee(emp);
                                    setEmployeeSearchOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {getInitials(emp.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{emp.name}</p>
                                      <p className="text-xs text-muted-foreground">{emp.position}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {DEPARTMENTS[emp.department]?.name}
                                    </Badge>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Category */}
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={newCategory} onValueChange={(v) => setNewCategory(v as MessageCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MESSAGE_CATEGORIES).map(([key, cat]) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label>Asunto *</Label>
                  <Input 
                    placeholder="Ej: Justificación de ausencia del día..." 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label>Mensaje *</Label>
                  <Textarea 
                    placeholder="Escribe tu mensaje..." 
                    rows={4}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                  />
                </div>

                {/* Attachment */}
                <div className="space-y-2">
                  <Label>Adjuntar Evidencia (opcional)</Label>
                  <Input type="file" />
                </div>

                <Button className="w-full gradient-primary" onClick={handleSend}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card 
            className={`glass-card cursor-pointer transition-all ${activeFilter === 'received' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveFilter(activeFilter === 'received' ? 'all' : 'received')}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Inbox className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.received}</p>
                  <p className="text-sm text-muted-foreground">Recibidos</p>
                </div>
                {stats.unread > 0 && (
                  <Badge className="ml-auto">{stats.unread} nuevos</Badge>
                )}
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`glass-card cursor-pointer transition-all ${activeFilter === 'sent' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveFilter(activeFilter === 'sent' ? 'all' : 'sent')}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <SendHorizontal className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sent}</p>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{messages.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filters */}
            <Card className="glass-card">
              <CardContent className="py-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar mensajes..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as MessageCategory | 'all')}>
                  <SelectTrigger className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(MESSAGE_CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {activeFilter === 'sent' ? <SendHorizontal className="w-5 h-5 text-primary" /> : 
                     activeFilter === 'received' ? <Inbox className="w-5 h-5 text-primary" /> :
                     <MessageSquare className="w-5 h-5 text-primary" />}
                    {activeFilter === 'sent' ? 'Enviados' : activeFilter === 'received' ? 'Recibidos' : 'Todos'}
                  </span>
                  <Badge variant="outline">{filteredMessages.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No hay mensajes</p>
                  </div>
                ) : (
                  filteredMessages.map((msg, index) => {
                    const isRead = !!msg.readAt;
                    const isSelected = selectedMessage?.id === msg.id;
                    const isResolved = !!msg.replied;
                    const isSent = msg.fromUserId === currentUserId;
                    
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-4 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30 hover:bg-muted/50'}`}
                        onClick={() => handleSelectMessage(msg)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(isSent ? msg.toUserName : msg.fromUserName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`text-sm truncate ${!isRead && !isSent ? 'font-semibold' : ''}`}>
                                {isSent ? `Para: ${msg.toUserName}` : msg.fromUserName}
                              </p>
                              <div className="flex items-center gap-1">
                                {isResolved && <CheckCircle2 className="w-3 h-3 text-success" />}
                                {!isRead && !isSent && <span className="w-2 h-2 rounded-full bg-primary" />}
                                {isSent && <SendHorizontal className="w-3 h-3 text-muted-foreground" />}
                              </div>
                            </div>
                            <p className="text-sm font-medium truncate">{msg.subject}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {msg.category && getCategoryBadge(msg.category)}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(msg.createdAt), "d MMM", { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{selectedMessage.subject}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(selectedMessage.fromUserName)}
                            </AvatarFallback>
                          </Avatar>
                          <span>De: <strong>{selectedMessage.fromUserName}</strong></span>
                          <span>·</span>
                          <span>Para: <strong>{selectedMessage.toUserName}</strong></span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {selectedMessage.category && getCategoryBadge(selectedMessage.category)}
                        {selectedMessage.replied && (
                          <Badge className="bg-success/10 text-success">Resuelto</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                    
                    {selectedMessage.attachmentUrl && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Paperclip className="w-4 h-4 text-primary" />
                        <span className="text-sm">Archivo adjunto: {selectedMessage.attachmentUrl}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Enviado: {format(new Date(selectedMessage.createdAt), "PPPP 'a las' HH:mm", { locale: es })}</span>
                      </div>
                      {selectedMessage.readAt && (
                        <div className="flex items-center gap-2">
                          <MailOpen className="w-4 h-4" />
                          <span>Leído: {format(new Date(selectedMessage.readAt), "PPPP 'a las' HH:mm", { locale: es })}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gradient-primary">
                            <Send className="w-4 h-4 mr-2" />
                            Responder
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Responder a: {selectedMessage.subject}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-muted/30 text-sm">
                              <p className="font-medium">{selectedMessage.fromUserName} escribió:</p>
                              <p className="text-muted-foreground mt-1 line-clamp-3">{selectedMessage.message}</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Tu respuesta</Label>
                              <Textarea 
                                placeholder="Escribe tu respuesta..." 
                                rows={4}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              />
                            </div>
                            <Button className="w-full" onClick={handleReply}>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar Respuesta
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {!selectedMessage.replied && selectedMessage.toUserId === currentUserId && (
                        <Button variant="outline" onClick={handleMarkAsResolved}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Marcar como resuelto
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="glass-card h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Selecciona un mensaje para ver los detalles</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
