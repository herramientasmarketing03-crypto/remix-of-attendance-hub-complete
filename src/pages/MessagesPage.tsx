import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Send, Mail, MailOpen, Clock, Plus, CheckCircle2, 
  Inbox, SendHorizontal, Search, FileText, HelpCircle, Calendar, AlertCircle, Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages, type Message } from '@/hooks/useMessages';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

type MessageCategory = 'justificacion' | 'consulta' | 'permiso' | 'vacaciones' | 'queja' | 'otro' | 'general';

const MESSAGE_CATEGORIES: Record<MessageCategory, { label: string; icon: typeof FileText; color: string }> = {
  justificacion: { label: 'Justificación', icon: FileText, color: 'bg-blue-500/10 text-blue-500' },
  consulta: { label: 'Consulta', icon: HelpCircle, color: 'bg-purple-500/10 text-purple-500' },
  permiso: { label: 'Solicitud de Permiso', icon: Calendar, color: 'bg-green-500/10 text-green-500' },
  vacaciones: { label: 'Vacaciones', icon: Calendar, color: 'bg-orange-500/10 text-orange-500' },
  queja: { label: 'Queja/Reclamo', icon: AlertCircle, color: 'bg-red-500/10 text-red-500' },
  otro: { label: 'Otro', icon: MessageSquare, color: 'bg-gray-500/10 text-gray-500' },
  general: { label: 'General', icon: MessageSquare, color: 'bg-gray-500/10 text-gray-500' },
};

type RecipientType = 'rrhh' | 'jefe' | 'gerencia';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const { messages, loading, sendMessage, markAsRead, markAsResolved } = useMessages(user?.id);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'received' | 'sent'>('all');
  const [categoryFilter, setCategoryFilter] = useState<MessageCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [recipientType, setRecipientType] = useState<RecipientType>('rrhh');
  const [newCategory, setNewCategory] = useState<MessageCategory>('consulta');
  const [newSubject, setNewSubject] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [replyText, setReplyText] = useState('');

  const currentUserId = user?.id || '';
  const currentUserName = `${profile?.nombres || 'Usuario'} ${profile?.apellidos || ''}`.trim();

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      if (activeFilter === 'sent' && msg.from_user_id !== currentUserId) return false;
      if (activeFilter === 'received' && msg.to_user_id !== currentUserId) return false;
      if (categoryFilter !== 'all' && msg.category !== categoryFilter) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          msg.subject.toLowerCase().includes(search) ||
          msg.message.toLowerCase().includes(search) ||
          msg.from_user_name.toLowerCase().includes(search) ||
          msg.to_user_name.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [messages, activeFilter, categoryFilter, searchTerm, currentUserId]);

  const stats = useMemo(() => {
    const received = messages.filter(m => m.to_user_id === currentUserId);
    const sent = messages.filter(m => m.from_user_id === currentUserId);
    const unread = received.filter(m => !m.read_at);
    return { received: received.length, sent: sent.length, unread: unread.length };
  }, [messages, currentUserId]);

  const getRecipientName = () => {
    switch (recipientType) {
      case 'rrhh': return 'Recursos Humanos';
      case 'jefe': return 'Mi Jefe Directo';
      case 'gerencia': return 'Gerencia General';
      default: return '';
    }
  };

  const handleSend = async () => {
    if (!newSubject || !newMessageText) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    try {
      await sendMessage({
        from_user_id: currentUserId,
        from_user_name: currentUserName,
        to_user_id: recipientType,
        to_user_name: getRecipientName(),
        to_user_type: recipientType,
        subject: newSubject,
        message: newMessageText,
        category: newCategory,
      });
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const resetForm = () => {
    setRecipientType('rrhh');
    setNewCategory('consulta');
    setNewSubject('');
    setNewMessageText('');
  };

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    if (!msg.read_at && msg.to_user_id === currentUserId) {
      await markAsRead(msg.id);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText) {
      toast.error('Escriba un mensaje de respuesta');
      return;
    }

    try {
      await sendMessage({
        from_user_id: currentUserId,
        from_user_name: currentUserName,
        to_user_id: selectedMessage.from_user_id,
        to_user_name: selectedMessage.from_user_name,
        to_user_type: 'employee',
        subject: `Re: ${selectedMessage.subject}`,
        message: replyText,
        category: selectedMessage.category as MessageCategory || 'general',
      });
      
      setReplyDialogOpen(false);
      setReplyText('');
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedMessage) return;
    await markAsResolved(selectedMessage.id);
    setSelectedMessage(prev => prev ? { ...prev, resolved: true } : null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCategoryBadge = (category?: string | null) => {
    if (!category) return null;
    const cat = MESSAGE_CATEGORIES[category as MessageCategory];
    if (!cat) return null;
    const Icon = cat.icon;
    return (
      <Badge variant="secondary" className={`gap-1 ${cat.color}`}>
        <Icon className="w-3 h-3" />
        {cat.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Mensaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enviar Mensaje</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinatario</Label>
                  <Select value={recipientType} onValueChange={(v) => setRecipientType(v as RecipientType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrhh">Recursos Humanos</SelectItem>
                      <SelectItem value="jefe">Mi Jefe Directo</SelectItem>
                      <SelectItem value="gerencia">Gerencia General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="space-y-2">
                  <Label>Asunto *</Label>
                  <Input 
                    placeholder="Ej: Justificación de ausencia del día..." 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mensaje *</Label>
                  <Textarea 
                    placeholder="Escribe tu mensaje..." 
                    rows={4}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                  />
                </div>

                <Button className="w-full" onClick={handleSend}>
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
            className={`cursor-pointer transition-all ${activeFilter === 'received' ? 'ring-2 ring-primary' : ''}`}
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
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all ${activeFilter === 'sent' ? 'ring-2 ring-primary' : ''}`}
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
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unread}</p>
                  <p className="text-sm text-muted-foreground">Sin leer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar mensajes..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as MessageCategory | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Object.entries(MESSAGE_CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-[600px] flex flex-col">
            <CardContent className="p-0 flex-1 overflow-auto">
              <div className="divide-y">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay mensajes</p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === msg.id ? 'bg-muted/50' : ''
                      } ${!msg.read_at && msg.to_user_id === currentUserId ? 'bg-primary/5' : ''}`}
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(msg.from_user_id === currentUserId ? msg.to_user_name : msg.from_user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {msg.from_user_id === currentUserId ? `Para: ${msg.to_user_name}` : msg.from_user_name}
                            </p>
                            {!msg.read_at && msg.to_user_id === currentUserId && (
                              <Badge variant="secondary" className="text-xs">Nuevo</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium truncate">{msg.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getCategoryBadge(msg.category)}
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(msg.created_at || new Date().toISOString()), 'dd MMM', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Detail */}
          <Card className="h-[600px] flex flex-col">
            <CardContent className="p-6 flex-1 overflow-auto">
              {selectedMessage ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(selectedMessage.from_user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{selectedMessage.from_user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Para: {selectedMessage.to_user_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(selectedMessage.created_at || new Date().toISOString()), 'PPP', { locale: es })}
                      </p>
                      {selectedMessage.resolved && (
                        <Badge className="bg-success/10 text-success mt-1">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Resuelto
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                    {getCategoryBadge(selectedMessage.category)}
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Send className="w-4 h-4 mr-2" />
                          Responder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Responder a {selectedMessage.from_user_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Re: {selectedMessage.subject}</p>
                          </div>
                          <Textarea 
                            placeholder="Escribe tu respuesta..." 
                            rows={4}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <Button className="w-full" onClick={handleReply}>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Respuesta
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {!selectedMessage.resolved && (
                      <Button variant="outline" onClick={handleMarkAsResolved}>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar Resuelto
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un mensaje para ver los detalles</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
