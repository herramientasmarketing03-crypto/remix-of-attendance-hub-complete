import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Mail, MailOpen, Clock, Paperclip, Plus } from 'lucide-react';
import { mockMessages } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MessagesPage = () => {
  const [selectedMessage, setSelectedMessage] = useState<typeof mockMessages[0] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSend = () => {
    toast.success('Mensaje enviado correctamente');
    setDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <p className="text-muted-foreground">Comunicación y justificaciones</p>
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
                  <Select>
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
                  <Input placeholder="Ej: Justificación de ausencia" />
                </div>
                <div className="space-y-2">
                  <Label>Mensaje</Label>
                  <Textarea placeholder="Escribe tu mensaje..." rows={4} />
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
                  Bandeja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockMessages.map((msg, index) => {
                  const isRead = !!msg.readAt;
                  const isSelected = selectedMessage?.id === msg.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30 hover:bg-muted/50'}`}
                      onClick={() => setSelectedMessage(msg)}
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
                            {!isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
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
                      <Badge variant="secondary">{DEPARTMENTS[selectedMessage.department]?.name}</Badge>
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
                    <div className="flex gap-2">
                      <Button className="gradient-primary">
                        <Send className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                      <Button variant="outline">Marcar como resuelto</Button>
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
