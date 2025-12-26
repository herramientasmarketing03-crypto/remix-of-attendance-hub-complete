import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Mail, MailOpen, Clock, Paperclip, Plus, CheckCircle2 } from 'lucide-react';
import { mockMessages } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/services/dataStorage';
import { logAction } from '@/services/auditLog';
import { AttendanceMessage } from '@/types/attendance';

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AttendanceMessage[]>(() => 
    loadFromStorage(STORAGE_KEYS.MESSAGES, mockMessages)
  );
  const [selectedMessage, setSelectedMessage] = useState<AttendanceMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  
  // New message form
  const [newRecipient, setNewRecipient] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  
  // Reply form
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
  }, [messages]);

  const handleSend = () => {
    if (!newRecipient || !newSubject || !newMessageText) {
      toast.error('Complete todos los campos');
      return;
    }

    const newMessage: AttendanceMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: user?.id || 'unknown',
      fromUserName: `${user?.nombres} ${user?.apellidos}`,
      toUserId: newRecipient,
      toUserName: newRecipient === 'rrhh' ? 'RRHH' : newRecipient === 'jefe' ? 'Mi Jefe Directo' : 'Gerencia General',
      department: 'ti',
      subject: newSubject,
      message: newMessageText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [newMessage, ...prev]);
    
    logAction('CREATE', 'justification', newMessage.id, user?.id || '', 
      `${user?.nombres} ${user?.apellidos}`, `Envió mensaje: ${newSubject}`);
    
    toast.success('Mensaje enviado correctamente');
    setDialogOpen(false);
    setNewRecipient('');
    setNewSubject('');
    setNewMessageText('');
  };

  const handleMarkAsRead = (message: AttendanceMessage) => {
    if (!message.readAt) {
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

    const replyMessage: AttendanceMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: user?.id || 'unknown',
      fromUserName: `${user?.nombres} ${user?.apellidos}`,
      toUserId: selectedMessage.fromUserId,
      toUserName: selectedMessage.fromUserName,
      department: selectedMessage.department,
      subject: `Re: ${selectedMessage.subject}`,
      message: replyText,
      createdAt: new Date().toISOString(),
    };

    // Mark original as replied
    setMessages(prev => [
      replyMessage,
      ...prev.map(m => m.id === selectedMessage.id ? { ...m, replied: true } : m)
    ]);

    logAction('UPDATE', 'justification', selectedMessage.id, user?.id || '', 
      `${user?.nombres} ${user?.apellidos}`, `Respondió mensaje: ${selectedMessage.subject}`);

    toast.success('Respuesta enviada');
    setReplyDialogOpen(false);
    setReplyText('');
  };

  const handleMarkAsResolved = () => {
    if (!selectedMessage) return;

    setMessages(prev => prev.map(m => 
      m.id === selectedMessage.id ? { ...m, replied: true, resolvedAt: new Date().toISOString() } : m
    ));

    logAction('UPDATE', 'justification', selectedMessage.id, user?.id || '', 
      `${user?.nombres} ${user?.apellidos}`, `Marcó como resuelto: ${selectedMessage.subject}`);

    toast.success('Mensaje marcado como resuelto');
    setSelectedMessage(prev => prev ? { ...prev, replied: true } : null);
  };

  const handleSelectMessage = (msg: AttendanceMessage) => {
    setSelectedMessage(msg);
    handleMarkAsRead(msg);
  };

  const unreadCount = messages.filter(m => !m.readAt).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <p className="text-muted-foreground">
              Comunicación y justificaciones
              {unreadCount > 0 && <Badge className="ml-2 bg-primary">{unreadCount} nuevos</Badge>}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Mensaje
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Mensaje</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinatario</Label>
                  <Select value={newRecipient} onValueChange={setNewRecipient}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrhh">RRHH</SelectItem>
                      <SelectItem value="jefe">Mi Jefe Directo</SelectItem>
                      <SelectItem value="general">Gerencia General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Asunto</Label>
                  <Input 
                    placeholder="Ej: Justificación de ausencia" 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensaje</Label>
                  <Textarea 
                    placeholder="Escribe tu mensaje..." 
                    rows={4}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adjuntar Evidencia (opcional)</Label>
                  <Input type="file" />
                </div>
                <Button className="w-full gradient-primary" onClick={handleSend}>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Bandeja ({messages.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {messages.map((msg, index) => {
                  const isRead = !!msg.readAt;
                  const isSelected = selectedMessage?.id === msg.id;
                  const isResolved = !!msg.replied;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30 hover:bg-muted/50'}`}
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${isRead ? 'text-muted-foreground' : 'text-primary'}`}>
                          {isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`text-sm truncate ${!isRead ? 'font-semibold' : ''}`}>
                              {msg.fromUserName}
                            </p>
                            <div className="flex items-center gap-1">
                              {isResolved && <CheckCircle2 className="w-3 h-3 text-success" />}
                              {!isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                          </div>
                          <p className="text-sm font-medium truncate">{msg.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{msg.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(msg.createdAt), "d MMM, HH:mm", { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedMessage.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          De: {selectedMessage.fromUserName} · Para: {selectedMessage.toUserName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{DEPARTMENTS[selectedMessage.department]?.name}</Badge>
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Enviado: {format(new Date(selectedMessage.createdAt), "PPPP 'a las' HH:mm", { locale: es })}</span>
                    </div>
                    {selectedMessage.readAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MailOpen className="w-4 h-4" />
                        <span>Leído: {format(new Date(selectedMessage.readAt), "PPPP 'a las' HH:mm", { locale: es })}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
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
                      {!selectedMessage.replied && (
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
